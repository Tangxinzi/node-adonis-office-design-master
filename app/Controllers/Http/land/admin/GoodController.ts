import Database from '@ioc:Adonis/Lucid/Database';
import Application from '@ioc:Adonis/Core/Application';
import Moment from 'moment';

export default class GoodController {
  public async index({ request, view, response }: HttpContextContract) {
    try {
      let goods = []
      const all = request.all()
      if (all.search) {
        goods = await Database.from('land_goods').select('*').where('status', 1).where('good_name', 'like', `%${ all.search }%`).orWhere('good_brand', 'like', `%${ all.search }%`).orderBy('created_at', 'desc').forPage(request.input('page', 1), 20)
      } else if (all.catalog) {
        goods = await Database.from('land_goods').select('*').where({ status: 1, good_catalog: all.catalog }).orderBy('created_at', 'desc').forPage(request.input('page', 1), 20)
      } else {
        goods = await Database.from('land_goods').select('*').where('status', all.status == 0 ? 0 : 1).orderBy('created_at', 'desc').forPage(request.input('page', 1), 20)

        for (let index = 0; index < goods.length; index++) {
          if (goods[index].good_supplier_id) {
            goods[index].good_supplier = await Database.from('land_supplier').select('*').where('id', goods[index].good_supplier_id).first()
          } else {
            goods[index].good_supplier = {}
          }
        }
      }

      for (let index = 0; index < goods.length; index++) {
        goods[index].good_theme_url = goods[index].good_theme_url ? JSON.parse(goods[index].good_theme_url) : []
        goods[index].catalog = await Database.from('land_goods_catalog').select('*').where({ id: goods[index].good_catalog, status: 1 }).first()
        goods[index].created_at = Moment(goods[index].created_at).format('YYYY-MM-DD H:mm:ss')
      }

      if (all.type == 'json') {
        return response.json({
          status: 200,
          message: "ok",
          data: goods
        })
      }

      return view.render('land/admin/good/index', {
        data: {
          title: '商城商品',
          active: 'good',
          goods
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  public async create({ view }: HttpContextContract) {
    try {
      const catalog = await Database.from('land_goods_catalog').select('*').where({ level: 1, status: 1 }).orderBy('created_at', 'desc')
      for (let index = 0; index < catalog.length; index++) {
        catalog[index].sub_catalog = await Database.from('land_goods_catalog').select('*').where({ parent_catalog_id: catalog[index].id, level: 2, status: 1 })
      }

      return view.render('land/admin/good/create', {
        data: {
          title: '创建商城商品',
          active: 'good',
          catalog
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  public async catalog({ request, response, view, session }: HttpContextContract) {
    try {
      const all = request.all()
      const catalog = await Database.from('land_goods_catalog').select('*').where({ level: 1, status: 1 }).orderBy('sort', 'asc')
      for (let index = 0; index < catalog.length; index++) {
        catalog[index].sub_catalog = await Database.from('land_goods_catalog').select('*').where({ parent_catalog_id: catalog[index].id, level: 2, status: 1 }).orderBy('sort', 'asc')
      }
      if (request.method() == 'GET') {
        let log = {}

        if (all.id) {
          log = await Database.from('land_goods_catalog').select('*').where({ id: all.id, status: 1 }).first()
        }

        if (all.type == 'json') {
          return response.json({
            status: 200,
            message: "ok",
            data: catalog
          })
        }

        return view.render('land/admin/good/catalog', {
          data: {
            title: '目录',
            active: 'catalog',
            catalog,
            log,
            all
          }
        })
      }

      if (request.method() == 'POST' && all.button == 'save') {
        let theme_url = all.theme_url || ''
        if (request.file('theme_url')) {
          const RandomString = require('RandomString')
          const profile = request.file('theme_url', { type: ['image', 'video'], size: '10mb' })
          const profileName = `${RandomString.generate(32)}.${profile.extname}`
          const profilePath = `/uploads/catalogs/`

          let file = {}
          file.fileName = profile.clientName
          file.fileSrc = profilePath + profileName
          await profile.move(Application.publicPath(profilePath), { name: profileName, overwrite: true })

          theme_url = file.fileSrc
        }

        const id = await Database.table('land_goods_catalog').returning('id').insert({
          name: all.name || '',
          level: all.is_catalog == 1 ? 1 : 2,
          parent_catalog_id: all.parent_catalog_id ? parseInt(all.parent_catalog_id) : '',
          sort: all.sort,
          theme_url
        })

        session.flash('message', { type: 'success', header: '创建成功', message: `` })
        return response.redirect('back')
      }

      if (request.method() == 'POST' && all.button == 'update') {
        let theme_url = all.theme_url || ''
        if (request.file('theme_url')) {
          const RandomString = require('RandomString')
          const profile = request.file('theme_url', { type: ['image', 'video'], size: '10mb' })
          const profileName = `${RandomString.generate(32)}.${profile.extname}`
          const profilePath = `/uploads/catalogs/`

          let file = {}
          file.fileName = profile.clientName
          file.fileSrc = profilePath + profileName
          await profile.move(Application.publicPath(profilePath), { name: profileName, overwrite: true })

          theme_url = file.fileSrc
        }

        const id = await Database.from('land_goods_catalog').where({ id: all.id }).update({
          name: all.name || '',
          level: all.is_catalog == 1 ? 1 : 2,
          parent_catalog_id: all.parent_catalog_id ? parseInt(all.parent_catalog_id) : '',
          sort: all.sort,
          theme_url
        })

        session.flash('message', { type: 'success', header: '更新成功', message: `` })
        return response.redirect('back')
      }
    } catch (error) {
      console.log(error)
    }
  }

  public async show({ params, request, view, response }: HttpContextContract) {
    try {
      const all = request.all()
      const good = await Database.from('land_goods').where('id', params.id).first()
      good.created_at = Moment(good.created_at).format('YYYY-MM-DD H:mm:ss')
      good.good_theme_url = good.good_theme_url ? JSON.parse(good.good_theme_url) : []

      const catalog = await Database.from('land_goods_catalog').select('*').where({ level: 1, status: 1 }).orderBy('created_at', 'desc')
      for (let index = 0; index < catalog.length; index++) {
        catalog[index].sub_catalog = await Database.from('land_goods_catalog').select('*').where({ parent_catalog_id: catalog[index].id, level: 2, status: 1 })
      }

      good.catalog_goods = await Database.from('land_goods').select('*').where({ status: 1, good_catalog: good.good_catalog }).orderBy('created_at', 'desc').forPage(request.input('page', 1), 20)
      for (let index = 0; index < good.catalog_goods.length; index++) {
        good.catalog_goods[index].good_theme_url = good.catalog_goods[index].good_theme_url ? JSON.parse(good.catalog_goods[index].good_theme_url) : []
      }

      const data = {
        status: 200,
        message: "ok",
        data: good
      }

      if (all.type == 'json') {
        return response.json(data)
      }

      return view.render('land/admin/good/edit', {
        data,
        catalog
      })
    } catch (error) {
      console.log(error)
    }
  }

  public async edit({ params, request, view, session }: HttpContextContract) {
    try {
      const all = request.all()
      const good = await Database.from('land_goods').where('id', params.id).first()
      good.good_theme_url = good.good_theme_url ? JSON.parse(good.good_theme_url) : []

      const catalog = await Database.from('land_goods_catalog').select('*').where({ level: 1, status: 1 }).orderBy('created_at', 'desc')
      for (let index = 0; index < catalog.length; index++) {
        catalog[index].sub_catalog = await Database.from('land_goods_catalog').select('*').where({ parent_catalog_id: catalog[index].id, level: 2, status: 1 })
      }

      return view.render('land/admin/good/edit', {
        data: {
          title: '编辑商城商品',
          active: 'good'
          good,
          catalog
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  public async save({ request, response, session }: HttpContextContract) {
    try {
      let all = request.all()
      let good_theme_url = all.theme_url || []
      good_theme_url = good_theme_url.filter(item => item !== null && item !== ''); // 整理图片集

      if (request.file('theme_url')) {
        const themes = request.files('theme_url', {
          types: ['image'],
          size: '2mb'
        })

        for (let index = 0; index < themes.length; index++) {
          let theme = themes[index];
          let RandomString = require('RandomString')
          const profileName = `${RandomString.generate(32)}.${theme.extname}`
          const profilePath = `/uploads/themes/`

          let file = {
            fileName: theme.clientName,
            fileSrc: profilePath + profileName
          }

          await theme.move(Application.publicPath(profilePath), { name: profileName, overwrite: true })

          good_theme_url[good_theme_url.length + index] = file.fileSrc
        }
      }

      if (request.method() == 'POST' && all.button == 'update') {
        await Database.from('land_goods').where('id', all.id).update({
          status: all.status,
          good_catalog: parseInt(parseInt(all.good_catalog)) || '',
          good_name: all.good_name,
          good_brand: all.good_brand,
          detail: all.detail,
          good_theme_url: JSON.stringify(good_theme_url)
        })
        session.flash('message', { type: 'success', header: '更新成功', message: `` })
        return response.redirect('back')
      }

      const id = await Database.table('land_goods').returning('id').insert({
        status: all.status,
        good_catalog: all.good_catalog || '',
        good_name: all.good_name || '',
        good_brand: all.good_brand || '',
        detail: all.detail || '',
        good_theme_url: JSON.stringify(good_theme_url)
      })

      session.flash('message', { type: 'success', header: '创建成功', message: `` })
      return response.redirect('back')
    } catch (error) {
      console.log(error)
      session.flash('message', { type: 'error', header: '提交失败', message: `捕获错误信息 ${ JSON.stringify(error) }。` })
    }
  }

  public async delete({ session, request, response }: HttpContextContract) {
    try {
      const all = request.all()
      if (all.button == 'good') {
        await Database.from('land_goods').where('id', all.id).update({ status: 0, deleted_at: Moment().format('YYYY-MM-DD HH:mm:ss') })
        session.flash('message', { type: 'success', header: '商城商品已删除成功！', message: `` })
      }

      if (all.button == 'catalog') {
        await Database.from('land_goods_catalog').where('id', all.id).update({ status: 0, deleted_at: Moment().format('YYYY-MM-DD HH:mm:ss') })
        session.flash('message', { type: 'success', header: '商城商品已删除成功！', message: `` })
      }

      return response.redirect('back')
    } catch (error) {
      console.log(error);
    }
  }

  public async supplier({ view, session, request, response }: HttpContextContract) {
    try {
      const all = request.all()
      const supplier = await Database.from('land_supplier').select('*').orderBy('created_at', 'desc')
      for (let index = 0; index < supplier.length; index++) {
        supplier[index].supplier_good_count = (await Database.from('land_goods').where({ good_supplier_id: supplier[index].id, status: 1 }).count('* as total'))[0].total || 0
        supplier[index].created_at = Moment(supplier[index].created_at).format('YYYY-MM-DD H:mm:ss')
      }
      return view.render('land/admin/good/supplier', {
        data: {
          title: '供应商',
          active: 'supplier',
          supplier
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  public async supplierSave({ view, session, request, response }: HttpContextContract) {
    try {
      const all = request.all()
      // const supplier = await Database.from('land_supplier').select('*').orderBy('created_at', 'desc').first()
      switch (all.button) {
        case 'add':
          await Database.table('land_supplier').insert({
            supplier_name: all.supplier_name,
            supplier_name_login: all.supplier_name_login,
            supplier_name_password: all.supplier_name_password,
            number: parseInt(all.number),
            status: parseInt(all.status),
          })
          break;
        case 'save':
          await Database.from('land_supplier').where({ id: all.id }).update({
            supplier_name: all.supplier_name,
            supplier_name_login: all.supplier_name_login,
            supplier_name_password: all.supplier_name_password,
            number: parseInt(all.number),
            status: parseInt(all.status),
          })
          break;
        case 'delete':
          await Database.from('land_supplier').where('id', all.id).update({ status: 0, deleted_at: Moment().format('YYYY-MM-DD HH:mm:ss') })
          break;
      }

      session.flash('message', { type: 'success', header: '操作成功', message: `` })
      return response.redirect('back')
    } catch (error) {
      console.log(error)
    }
  }
}
