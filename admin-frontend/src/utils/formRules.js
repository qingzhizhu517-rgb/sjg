export const createRequiredRule = (message) => ({
  required: true,
  message,
  trigger: 'blur',
})

const isEmpty = (value) => value === null || value === undefined || value === ''

const numberInRangeValidator = (min, max, message) => (_rule, value, callback) => {
  if (isEmpty(value)) {
    callback()
    return
  }
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue) || numericValue < min || numericValue > max) {
    callback(new Error(message))
    return
  }
  callback()
}

export const longitudeValidator = numberInRangeValidator(-180, 180, '经度需在 -180 到 180 之间')

export const latitudeValidator = numberInRangeValidator(-90, 90, '纬度需在 -90 到 90 之间')

export const minLengthValidator = (length, message) => (_rule, value, callback) => {
  if (typeof value !== 'string' || value.trim().length < length) {
    callback(new Error(message))
    return
  }
  callback()
}
