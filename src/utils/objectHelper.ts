type AnyObject = { [x: string]: any }

export const whitelistObjField = (
  obj: AnyObject,
  ...allowedFileds: string[]
) => {
  const newObj: AnyObject = {}
  Object.keys(obj).forEach(el => {
    if (allowedFileds.includes(el)) {
      newObj[el] = obj[el]
    }
  })
  return newObj
}

export const blackListObjField = (
  obj: AnyObject,
  ...removeFileds: string[]
) => {
  const newObj: AnyObject = {}
  Object.keys(obj).forEach(el => {
    if (!removeFileds.includes(el)) {
      newObj[el] = obj[el]
    }
  })
  return newObj
}
