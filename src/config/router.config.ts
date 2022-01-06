import Router, {
  asyncFrameRoutes,
  asyncAppRoutes,
  frameworkRouter,
  frameWhiteListRoutes,
  WHITE_LIST,
} from '@/router'
import { USER_TOKEN } from '@/utils/constant'
import { getRootUrl } from '@/utils'
import { freeLogin, getViewMenuByUser } from '@/api/module/login'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { userStore } from '@/store/user'
import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

const Store = userStore()
/**
 * @param {*} to 即将要进入的目标 路由对象
 * @param {*} from 当前导航正要离开的路由
 * @param {*} next 一定要调用该方法来 resolve 这个钩子。执行效果依赖 next 方法的调用参数
 */

/**
 * @param next(): 进行管道中的下一个钩子。如果全部钩子执行完了，则导航的状态就是 confirmed (确认的)。
 * @param next(false): 中断当前的导航。如果浏览器的 URL 改变了 (可能是用户手动或者浏览器后退按钮)，那么 URL 地址会重置到 from 路由对应的地址。
 * @param next('/') 或者 next({ path: '/' }): 跳转到一个不同的地址。当前的导航被中断，然后进行一个新的导航。你可以向 next 传递任意位置对象，且允许设置诸如 replace: true、name: 'home' 之类的选项以及任何用在 router-link 的 to prop 或 router.push 中的选项。
 * @param next(error): (2.4.0+) 如果传入 next 的参数是一个 Error 实例，则导航会被终止且该错误会被传递给 router.onError() 注册过的回调。
 */

Router.beforeEach(
  async (to: RouteLocationNormalized, form: RouteLocationNormalized, next: Function) => {
    // 如果是跳转登录页，则先清除token
    const LIST = ['/external/ssologin', '/login']
    if (LIST.includes(to.path)) localStorage.removeItem(USER_TOKEN)
    if (to.path === '/external/ssologin') {
      const res = await handleFreeLogin(to, next)
      // 登录成功中断执行
      if (res) return
    }
    // 设置文档title
    setTitle(to)
    const TOKEN = localStorage.getItem(USER_TOKEN)
    // match 当存在用路由 /login/admin这种方式通过param传参时，通过match来匹配路由
    TOKEN ? _hasRouter(to, form, next) : _hasInWhiteList(<string>(to.meta?.match || to.path), next)
  }
)

// 免登陆
const handleFreeLogin = async (to: RouteLocationNormalized, next: Function) => {
  // 后端要求写
  const grantCode = 'eOuXmzb2RqNJ55OLlVgbngQY/1+lA20rwQ70IOPsonwfZ/nGBRq1/g6NMrVX7EmP'
  try {
    let loginName = 'xxxxx'
    const res = await freeLogin({ grantCode, username: loginName })
    localStorage.setItem(USER_TOKEN, res.data.accessToken)
    // 保存刷新token
    localStorage.setItem('refreshToken', res.data.refreshToken)
    ElMessage({
      message: '登录成功',
      type: 'success',
    })
    next('/')
    return true
  } catch (error) {
    return false
  }
}

// 设置文档title
const setTitle = (to: RouteLocationNormalized) => {
  if (to.meta?.name) {
    document.title = <string>to.meta.name
  }
}

// token存在，则走验证流程
function _hasRouter(to: RouteLocationNormalized, from: RouteLocationNormalized, next: Function) {
  let router = Store.addRouter
  // first: 初始addRouter为空数组，空数组则ajax拉取数据
  // second: addRouter为null时，是在 上一条中 ajax拉取数据失败或者 权限为空 时会设置为null. 则正常访问即可，会此匹配到404页面
  // three: addRouter长度大于0时，则正常访问页面
  if (router?.length === 0) _getRouterMap(to, next)
  else {
    _hasAccess(<string>(to.meta?.match || to.path), next)
  }
}

// 系统中存在的路由map
const EXIT_ROUTER_MAP = [...asyncFrameRoutes, ...asyncAppRoutes].map((x) => x.meta?.match || x.path)

// 验证当前访问url是否存在以及是否有权限访问
function _hasAccess(path: string, next: Function) {
  // 用户拥有的权限
  const HAS_ROUTER_MAP = Store.hasRouterMap
  // 是否是系统中已有的路由
  const IS_IN_EXIT = EXIT_ROUTER_MAP.includes(path)
  // 是否为用户已有的权限的路由
  const IS_NOT_IN_HAS = !HAS_ROUTER_MAP.includes(path)
  // 是否为路由白名单路径
  const IS_NOT_IN_WHITE = !WHITE_LIST.includes(path)
  IS_IN_EXIT && IS_NOT_IN_HAS && IS_NOT_IN_WHITE ? next('/403') : next()
}

// 验证是否存在白名单用户
function _hasInWhiteList(path: string, next: Function) {
  // 获取租户标识
  let tenantSign = localStorage.getItem('tenantSign') || ''
  WHITE_LIST.includes(path) ? next() : next('/login/' + tenantSign)
}

// 查找并返回对应的路由item
// ROUTER_MAP 需要查找的路由表
function _findRouterItem(PATH: string, ROUTER_MAP: RouteRecordRaw[]) {
  let result = ROUTER_MAP.find((x) => {
    // 路由中存在 /unit-registration/:id?  等路由结构，需在分割以后取第一个数组值
    // 默认所有一级路由 在带一个斜杠
    let xPath = getRootUrl(x.path)
    return xPath === PATH || PATH.includes(xPath + '?')
  })
  return result || {}
}

// axios获取路由
async function _getRouterMap(to: RouteLocationNormalized, next: Function) {
  // ROUTER_DSL 菜单描述Tree，用于动态生成路由表 homeConfig 决定首页.
  let { ROUTER_DSL, homeConfig } = await queryMenuDSL()
  // 如果获取的权限DSL为空，则将此处的addRouter从空数组变成null
  // 具体详见_hasRouter 中的注释
  if (!ROUTER_DSL) {
    Store.commit('setState', { name: 'addRouter', value: null })
    _hasAccess(to.meta?.match || to.path, next)
    return false
  }
  // 路由解析
  let _resolveRouteItem = (ITEM, frameRouterList, AppRouterList) => {
    // 查找挂载框架下的路由
    let frameRouterItem = _findRouterItem(ITEM.url, asyncFrameRoutes)
    // 查找挂载APP下的路由
    let AppRouterItem = _findRouterItem(ITEM.url, asyncAppRoutes)
    if (Object.keys(frameRouterItem).length !== 0)
      _setRouter(ITEM, frameRouterItem, frameRouterList)
    else if (Object.keys(AppRouterItem).length !== 0) _setRouter(ITEM, AppRouterItem, AppRouterList)
  }
  /**
   * 设置路由
   * @param {*} ITEM menu的描述数据
   * @param {*} routerItem 查找出的路由
   * @param {*} routerList 需要添加的路由数组
   */
  const _setRouter = (ITEM, routerItem, routerList) => {
    // 查找路由item
    // 查找出重复路由
    let repetRouter = routerList.find((k) => k.path === routerItem.path)
    // 如果路由不为空对象时才能进行添加
    if (Object.keys(routerItem).length !== 0 && !repetRouter) {
      if (!routerItem.meta) routerItem.meta = {}
      // 获取当前菜单设置的权限点 用于各页面控制权限点 wrSign  1查看，  2 操作
      const authority = ITEM.wrSign
      // 给所有的子路由、以及带 /:参数的路由 设置专用于匹配的字段 match // 默认只有两集路由
      const _setMatchUrl = (item) => {
        const pathArr = item.path.split('/:')
        // 先对父级/:参数的路由设置
        if (pathArr.length !== 1) item.meta = { ...item.meta, match: pathArr[0] }
        // 对自己统一设置
        if (item.children?.length) {
          item.children.map((x) => {
            // path: ''  为路由首页 设置后端取值的name
            if (x.path === '') x.meta = { ...x.meta, authority, match: pathArr[0], name: ITEM.name }
            else x.meta = { ...x.meta, authority, match: pathArr[0] }
          })
        } else item.meta = { ...item.meta, authority, name: ITEM.name }
      }
      _setMatchUrl(routerItem)
      routerList.push(routerItem)
    }
  }
  // 解析DSL
  /**
   *
   * @param {*} MENU 菜单描述
   * @param {*} menuList 返回新的菜单数据
   * @param {*} frameRouterList 动态生成的路由，挂载框架里面
   * @param {*} AppRouterList 动态生成的路由，挂载全局的页面
   */
  let _resolveList = (MENU, menuList = [], frameRouterList = [], AppRouterList = []) => {
    MENU.map((x) => {
      // 根据DSL生成菜单item
      let item = {
        name: x.name,
        path: x.url,
        icon: x.icon,
        menuId: x.menuId || x.id,
        backgroundColour: x.backgroundColour,
        currentPageOpen: x.currentPageOpen,
        children: [],
      }
      // 规定：有url时，则再有子集都是权限点.
      if (x.url) _resolveRouteItem(x, frameRouterList, AppRouterList)
      else
        item.children = _resolveList(x.children || [], [], frameRouterList, AppRouterList).menuList
      menuList.push(item)
    })
    return { menuList, frameRouterList, AppRouterList }
  }
  let { menuList, frameRouterList, AppRouterList } = _resolveList(ROUTER_DSL)
  // 兼容当menuList为空数组时，会导致死循环
  frameRouterList = frameRouterList.length === 0 ? null : frameRouterList
  Store.commit('setState', { name: 'menuList', value: menuList })
  Store.commit('setState', { name: 'addRouter', value: [...frameRouterList, ...AppRouterList] })
  // homeConfig: 首页设置 0:安全搜索，1数据看板
  // const HOME_PAGE = { path: '', redirect: homeConfig === 0 ? '/safe-search' : '/data-board' }
  const HOME_PAGE_URL = homeConfig === 0 ? '/safe-search' : '/data-board'
  let frameworkCHild = [...frameRouterList, ...frameWhiteListRoutes]
  // 默认首页，当没有 数据看板，或智能搜索时，使用默认首页
  const HOME_PAGE_DEFAULT = frameWhiteListRoutes.find((x) => (x.match || x.path) === '/guide-home')
  // 查找出对应的页面，设置其别名为 '/'
  let HOME_PAGE_ROUTE =
    frameworkCHild.find((x) => (x.match || x.path) === HOME_PAGE_URL) || HOME_PAGE_DEFAULT
  HOME_PAGE_ROUTE.alias = '/'
  // 将获取到权限路由 挂载在layout布局下
  frameworkRouter.children = frameworkCHild
  // AppRouterList可能不存在，不存咋则进行过滤
  const routerMap = [frameworkRouter, ...AppRouterList].filter((x) => !!Object.keys(x).length)
  Router.addRoutes(routerMap)
  next({ ...to })
}

// 接口获取用户信息
// eslint-disable-next-line no-unused-vars
// 这里的返回值需特殊注意： 当无路由添加时，需返回null。 不能返回空数组
// 详见_hasRouter方法中的判断
async function queryMenuDSL() {
  try {
    // 查询用户信息
    Store.dispatch('queryUserInfo')
    let [config, DSL] = await axios.all([getViewMenuByUser(), Store.dispatch('queryDataRange')])
    // 将获取到的DSL存到store.供其他地方使用
    // Store.commit('setState', { name: 'nodeList', value: DSL.data || [] })
    // ROUTER_DSL 菜单描述Tree，用于动态生成路由表 homeConfig 决定首页.
    return { ROUTER_DSL: DSL.data?.length === 0 ? null : DSL.data, homeConfig: config?.index }
  } catch (error) {
    return { ROUTER_DSL: null }
  }
}
