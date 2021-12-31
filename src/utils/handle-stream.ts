/**
 *  将ajax获取的二进制流转换生成excel文件并下载
 *  文件流写入excel,从而实现该excel文件的下载
 **/
interface StreamParams {
  filename: string
  data: Blob
}
export default function handleStream({ filename, data }: StreamParams) {
  const blob = new Blob([data])
  // const time = format(new Date()).substring(0, 10)
  // const fileName = `${name}${time}.xls`
  // const fileName = `${name}${time}.${suffix}`
  if ('download' in document.createElement('a')) {
    // 非IE下载
    const elink = document.createElement('a')
    elink.download = filename
    elink.style.display = 'none'
    elink.href = URL.createObjectURL(blob)
    document.body.appendChild(elink)
    elink.click()
    URL.revokeObjectURL(elink.href) // 释放URL 对象
    document.body.removeChild(elink)
  } else {
    // IE10+下载
    // @ts-ignore
    navigator.msSaveBlob(blob, filename)
  }
}
