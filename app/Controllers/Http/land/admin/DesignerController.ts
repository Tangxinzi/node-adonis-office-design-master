import Database from '@ioc:Adonis/Lucid/Database';
import Application from '@ioc:Adonis/Core/Application';
import Moment from 'moment';

export default class DesignerController {
  public async index({ request, response, view, session }: HttpContextContract) {
    try {
      const all = request.all(), catalog = ['其它', '设计团队', '工程管理团队']
      const designers = await Database.from('land_designers').where('status', 1).orderBy('created_at', 'desc').forPage(request.input('page', 1), 20)
      for (let index = 0; index < designers.length; index++) {
        designers[index].works = designers[index].works ? designers[index].works.split(',') : []
        designers[index].labels = designers[index].labels ? designers[index].labels.split(',') : []
        designers[index].catalog = catalog[designers[index].catalog]
        designers[index].created_at = Moment(designers[index].created_at).format('YYYY-MM-DD H:mm:ss')
      }

      if (all.type == 'json') {
        const designers = await Database.from('land_designers').where('status', 1).orderBy('created_at', 'desc').forPage(request.input('page', 1), 8)
        for (let index = 0; index < designers.length; index++) {
          designers[index].works = designers[index].works ? designers[index].works.split(',') : []
          designers[index].labels = designers[index].labels ? designers[index].labels.split(',') : []
          designers[index].catalog = catalog[designers[index].catalog]
          designers[index].created_at = Moment(designers[index].created_at).format('YYYY-MM-DD H:mm:ss')
        }

        return response.json({
          status: 200,
          message: "ok",
          data: designers
        })
      }

      return view.render('land/admin/designer/index', {
        data: {
          title: '设计师',
          active: 'designer',
          designers,
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
      return view.render('land/admin/designer/create', {
        data: {
          title: '创建设计师',
          active: 'designer',
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
        var data = await Database.from('land_designers').where({ status: 1, catalog: params.catalog }).where('nickname', 'like', `%${ all.search }%`).orderBy('created_at', 'desc')
      } else {
        var data = await Database.from('land_designers').where({ status: 1, catalog: params.catalog }).orderBy('created_at', 'desc').limit(8)
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
      const data = await Database.from('land_designers').where('id', params.id).first()
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
      return view.render('land/admin/designer/edit', {
        data: {
          title: '编辑设计师',
          active: 'designer',
          works: await Database.table('land_works'),
          designer: await Database.from('land_designers').where('id', params.id).first()
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
        const RandomString = require('RandomString')
        const profile = request.file('avatar', { type: ['image'], size: '2mb' })
        const profileName = `${RandomString.generate(32)}.${profile.extname}`
        const profilePath = `/uploads/avatars/`

        let file = {}
        file.fileName = profile.clientName
        file.fileSrc = profilePath + profileName
        await profile.move(Application.publicPath(profilePath), { name: profileName, overwrite: true })

        avatar_url = file.fileSrc
      }

      if (request.method() == 'POST' && all.button == 'update') {
        await Database.from('land_designers').where('id', all.id).update({ catalog: all.catalog, nickname: all.nickname, sex: all.sex, works: all.works, labels: all.labels, detail: all.detail, avatar_url })
        session.flash('message', { type: 'success', header: '更新成功', message: `` })
        return response.redirect('back')
      }

      const id = await Database.table('land_designers').returning('id').insert({
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
      await Database.from('land_designers').where('id', all.id).update({ status: 0, deleted_at: Moment().format('YYYY-MM-DD HH:mm:ss') })
      session.flash('message', { type: 'success', header: '设计师已删除成功！', message: `` })
      return response.redirect('back')
    } catch (error) {
      console.log(error);
    }
  }
}
