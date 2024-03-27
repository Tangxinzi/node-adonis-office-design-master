/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async ({ view }) => {
  return view.render('welcome')
})


Route.group(() => {
  Route.get('/search', 'land/admin/SearchController.index')
  Route.post('/file/upload', 'land/admin/FilesController.upload')

  Route.get('/user/index', 'land/admin/UserController.index')
  Route.get('/user/wx-login', 'land/admin/UserController.wxLogin')
  Route.get('/user/get-phone-number', 'land/admin/UserController.getPhoneNumber')
  Route.get('/user/info', 'land/admin/UserController.userinfo')
  Route.get('/user/collection', 'land/admin/UserController.collection')
  Route.post('/user/info/upload', 'land/admin/UserController.userinfo')
  Route.get('/user/like/:id', 'land/admin/UserController.like')
  Route.post('/user/like/:id', 'land/admin/UserController.like')
  Route.post('/user/calculator-log', 'land/admin/UserController.calculatorLog')

  Route.get('/desginer', 'land/admin/DesginerController.index')
  Route.get('/desginer/sort', 'land/admin/DesginerController.sort')
  Route.post('/desginer/sort', 'land/admin/DesginerController.sort')
  Route.get('/desginer/manage', 'land/admin/DesginerController.manage')
  Route.get('/desginer/catalog/:catalog', 'land/admin/DesginerController.catalog')
  Route.get('/desginer/create', 'land/admin/DesginerController.create')
  Route.get('/desginer/show/:id', 'land/admin/DesginerController.show')
  Route.get('/desginer/edit/:id', 'land/admin/DesginerController.edit')
  Route.post('/desginer/save', 'land/admin/DesginerController.save')
  Route.post('/desginer/delete', 'land/admin/DesginerController.delete')
  Route.post('/desginer/desginerSave', 'land/admin/DesginerController.desginerSave')

  Route.get('/work', 'land/admin/WorkController.index')
  Route.get('/work/catalog/:catalog', 'land/admin/WorkController.catalog')
  Route.get('/work/create', 'land/admin/WorkController.create')
  Route.get('/work/show/:id', 'land/admin/WorkController.show')
  Route.get('/work/edit/:id', 'land/admin/WorkController.edit')
  Route.post('/work/save', 'land/admin/WorkController.save')
  Route.post('/work/delete', 'land/admin/WorkController.delete')

  Route.get('/datas', 'land/admin/DataController.index')
  Route.get('/calculator', 'land/admin/CalculatorController.index')

  Route.get('/feedback', 'land/admin/FeedbackController.index')
  Route.post('/feedback/submit', 'land/admin/FeedbackController.save')

  Route.get('/article', 'land/admin/ArticleController.index')
  Route.get('/article/catalog/:catalog', 'land/admin/ArticleController.catalog')
  Route.get('/article/create', 'land/admin/ArticleController.create')
  Route.get('/article/show/:id', 'land/admin/ArticleController.show')
  Route.get('/article/edit/:id', 'land/admin/ArticleController.edit')
  Route.post('/article/save', 'land/admin/ArticleController.save')
  Route.post('/article/delete', 'land/admin/ArticleController.delete')

  Route.get('/good', 'land/admin/GoodController.index')
  Route.get('/good/sort', 'land/admin/GoodController.sort')
  Route.post('/good/sort', 'land/admin/GoodController.sort')
  Route.get('/good/catalog', 'land/admin/GoodController.catalog')
  Route.get('/good/supplier', 'land/admin/GoodController.supplier')
  Route.post('/good/supplier/save', 'land/admin/GoodController.supplierSave')
  Route.post('/good/catalog', 'land/admin/GoodController.catalog')
  Route.get('/good/create', 'land/admin/GoodController.create')
  Route.get('/good/show/:id', 'land/admin/GoodController.show')
  Route.get('/good/edit/:id', 'land/admin/GoodController.edit')
  Route.post('/good/save', 'land/admin/GoodController.save')
  Route.post('/good/delete', 'land/admin/GoodController.delete')

  // datas event-tracking
  Route.post('/datas/tracking/odm', 'land/admin/TrackingController.informationImprovementProcess')

  Route.get('/pms', 'land/pms/IndexController.index')
  Route.post('/pms/save', 'land/pms/IndexController.save')
  Route.post('/pms/file', 'land/pms/IndexController.file')
  Route.post('/pms/member', 'land/pms/IndexController.member')
  Route.post('/pms/products', 'land/pms/IndexController.products')
  Route.post('/pms/notifications', 'land/pms/IndexController.notifications')
  Route.get('/pms/:id/steps/:step', 'land/pms/IndexController.steps')
}).prefix('/land')

Route.group(() => {
  Route.get('/login/:desginer_name_login', 'land/admin/DesginerManageController.login')
  Route.post('/login/:desginer_name_login', 'land/admin/DesginerManageController.login')
  Route.get('/manage', 'land/admin/DesginerManageController.manage')
  Route.post('/manage/update', 'land/admin/DesginerManageController.update')
  Route.get('/manage/work/create', 'land/admin/DesginerManageController.create')
  Route.get('/manage/work/edit/:id', 'land/admin/DesginerManageController.edit')
  Route.post('/manage/work/save', 'land/admin/DesginerManageController.save')

  Route.get('/manage/user/edit', 'land/admin/DesginerManageController.editUserinfo')
  Route.post('/manage/user/save', 'land/admin/DesginerManageController.updateUserinfo')
  Route.get('/manage/user/qrcode', 'land/admin/DesginerManageController.qrcode')
}).prefix('/land-desginer')

Route.group(() => {
  Route.get('/login/:supplier_name_login', 'land/admin/SupplierController.login')
  Route.post('/login/:supplier_name_login', 'land/admin/SupplierController.login')
  Route.get('/goods', 'land/admin/SupplierController.index')
  Route.get('/goods/create', 'land/admin/SupplierController.create')
  Route.get('/goods/edit/:id', 'land/admin/SupplierController.edit')
  Route.post('/goods/create', 'land/admin/SupplierController.save')
  Route.post('/goods/delete', 'land/admin/SupplierController.delete')
}).prefix('/land-supplier')
