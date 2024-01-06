import Database from '@ioc:Adonis/Lucid/Database';
import Application from '@ioc:Adonis/Core/Application';
import Moment from 'moment';
import randomstring from 'randomstring';

export default class DesginerController {
  public async login({ params, request, response, view, session }: HttpContextContract) {
    try {
      if (request.method() == 'POST') {
        const all = request.all()
        if (params.desginer_name_login && all.password) {
          const desginer = await Database.from('land_desginers_manage').where({ status: 1, desginer_name_login: params.desginer_name_login, desginer_name_password: all.password }).first() || {}
          if (desginer.id) {
            session.put('adonis-cookie-desginer', desginer)
            return response.redirect().status(301).toRoute('land/admin/DesginerManageController.manage')
          } else {
            session.flash('message', { type: 'error', header: '登录失败', message: `请检查您的账号，或者联系管理员处理。` })
            return response.redirect('back')
          }
        } else {
          session.forget('adonis-cookie-desginer')
          return view.render('land/desginer/login', {
            data: {
              title: '登录'
            }
          })
        }
      } else {
        session.forget('adonis-cookie-desginer')
        return view.render('land/desginer/login', {
          data: {
            title: '登录'
          }
        })
      }
    } catch (error) {
      console.log(error);
    }
  }

  public async manage({ session, request, response, view }: HttpContextContract) {
    try {
      const all = request.all()
      const manages = await Database.from('land_desginers_manage').orderBy('created_at', 'desc').forPage(request.input('page', 1), 20)
      for (let index = 0; index < manages.length; index++) {
        manages[index].desginer = await Database.from('land_desginers').select('nickname').where({ status: 1, id: manages[index].desginer_relation_id }).first() || {}
        manages[index].created_at = Moment(manages[index].created_at).format('YYYY-MM-DD H:mm:ss')
      }
      return view.render('land/admin/desginer/manages', {
        data: {
          title: '设计师管理',
          active: 'desginer',
          manages,
          all
        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  public async index({ request, response, view, session }: HttpContextContract) {
    try {
      const all = request.all(), catalog = ['其它', '设计团队', '工程管理团队']
      const desginers = await Database.from('land_desginers').where('status', 1).orderBy('created_at', 'desc').forPage(request.input('page', 1), 20)
      for (let index = 0; index < desginers.length; index++) {
        desginers[index].works = desginers[index].works ? desginers[index].works.split(',') : []
        desginers[index].labels = desginers[index].labels ? desginers[index].labels.split(',') : []
        desginers[index].catalog = catalog[desginers[index].catalog]
        desginers[index].created_at = Moment(desginers[index].created_at).format('YYYY-MM-DD H:mm:ss')
      }

      if (all.type == 'json') {
        const desginers = await Database.from('land_desginers').where('status', 1).orderBy('created_at', 'desc').forPage(request.input('page', 1), 8)
        for (let index = 0; index < desginers.length; index++) {
          desginers[index].works = desginers[index].works ? desginers[index].works.split(',') : []
          desginers[index].labels = desginers[index].labels ? desginers[index].labels.split(',') : []
          desginers[index].catalog = catalog[desginers[index].catalog]
          desginers[index].created_at = Moment(desginers[index].created_at).format('YYYY-MM-DD H:mm:ss')
        }

        return response.json({
          status: 200,
          message: "ok",
          data: desginers
        })
      }

      return view.render('land/admin/desginer/index', {
        data: {
          title: '设计师',
          active: 'desginer',
          desginers,
          all
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  public async create({ request, view, session }: HttpContextContract) {
    try {
      const all = request.all()
      return view.render('land/admin/desginer/create', {
        data: {
          title: '创建设计师',
          active: 'desginer',
          works: await Database.table('land_works')
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  public async catalog({ params, request, view, response }: HttpContextContract) {
    try {
      const all = request.all()
      if (all.search) {
        var data = await Database.from('land_desginers').where({ status: 1, catalog: params.catalog }).where('nickname', 'like', `%${ all.search }%`).orderBy('created_at', 'desc').forPage(request.input('page', 1), 8)
      } else {
        var data = await Database.from('land_desginers').where({ status: 1, catalog: params.catalog }).orderBy('created_at', 'desc').forPage(request.input('page', 1), 8)
      }

      for (let index = 0; index < data.length; index++) {
        data[index].labels = data[index].labels ? data[index].labels.split(',') : []
      }

      if (all.type == 'json') {
        return response.json({
          status: 200,
          message: "ok",
          data
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  public async show({ params, request, view, response }: HttpContextContract) {
    try {
      const all = request.all()
      const data = await Database.from('land_desginers').where('id', params.id).first()
      data.labels = data.labels ? data.labels.split(',') : []
      data.works = await Database.from('land_works').select('id', 'title', 'labels', 'theme_url').where('status', 1).whereIn('id', data.works ? data.works.split(',') : [])
      data.works.labels = data.works.labels ? data.works.labels.split(',') : []

      if (all.type == 'json') {
        return response.json({
          status: 200,
          message: "ok",
          data
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  public async edit({ params, request, view, session }: HttpContextContract) {
    try {
      const all = request.all()
      return view.render('land/admin/desginer/edit', {
        data: {
          title: '编辑设计师',
          active: 'desginer',
          works: await Database.table('land_works'),
          desginer: await Database.from('land_desginers').where('id', params.id).first()
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  public async save({ request, response, session }: HttpContextContract) {
    try {
      let all = request.all()
      let avatar_url = all.avatar_url || ''
      if (request.file('avatar')) {
        const profile = request.file('avatar', { type: ['image'], size: '2mb' })
        const profileName = `${randomstring.generate(32)}.${profile.extname}`
        const profilePath = `/uploads/avatars/`

        let file = {}
        file.fileName = profile.clientName
        file.fileSrc = profilePath + profileName
        await profile.move(Application.publicPath(profilePath), { name: profileName, overwrite: true })

        avatar_url = file.fileSrc
      }

      if (request.method() == 'POST' && all.button == 'update') {
        await Database.from('land_desginers').where('id', all.id).update({ catalog: all.catalog, nickname: all.nickname, sex: all.sex, works: all.works, labels: all.labels, detail: all.detail, avatar_url })
        session.flash('message', { type: 'success', header: '更新成功', message: `` })
        return response.redirect('back')
      }

      const id = await Database.table('land_desginers').returning('id').insert({
        catalog: all.catalog,
        nickname: all.nickname,
        sex: all.sex,
        labels: all.labels,
        detail: all.detail,
        avatar_url
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
      await Database.from('land_desginers').where('id', all.id).update({ status: 0, deleted_at: Moment().format('YYYY-MM-DD HH:mm:ss') })
      session.flash('message', { type: 'success', header: '设计师已删除成功！', message: `` })
      return response.redirect('back')
    } catch (error) {
      console.log(error);
    }
  }
}
