function base64ToFile(dataurl: string, filename: string) {
  const arr = dataurl.split(',') || [''],
    mime = arr[0].match(/:(.*?);/)?.[1],
    bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export default base64ToFile;
