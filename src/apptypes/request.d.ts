import { Request } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { UserTypes } from '@models/userModel'

export interface AppRequest extends Request {
  user?: UserTypes
}

export interface IContextRequest<T> extends Omit<AppRequest, 'context'> {
  context: T
}

export interface IBodyRequest<T> extends Omit<AppRequest, 'body'> {
  body: T
}

export interface IParamsRequest<T> extends AppRequest {
  params: T & ParamsDictionary
}

export interface IQueryRequest<T> extends AppRequest {
  query: T & ParamsDictionary
}
