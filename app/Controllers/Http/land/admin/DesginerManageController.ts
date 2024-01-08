import Database from '@ioc:Adonis/Lucid/Database';
import Application from '@ioc:Adonis/Core/Application';
import Moment from 'moment';
import randomstring from 'randomstring';
import Weixin from "./Weixin";

export default class DesginerManageController {
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

  public async manage({ request, view, session }: HttpContextContract) {
    try {
      const data = session.get('adonis-cookie-desginer')
      data.desginer = await Database.from('land_desginers').where({ status: 1, id: data.relation_desginer_id }).first() || {}
      data.works = await Database.from('land_works').select('id', 'title', 'labels', 'theme_url', 'work_time', 'status').where('relation_desginer_id', data.relation_desginer_id).andWhereNull('deleted_at')

      return view.render('land/desginer/manages', {
        data: {
          title: '设计师',
          active: 'desginer',
          data
        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  public async qrcode({ request, view, session }: HttpContextContract) {
    try {
      const data = session.get('adonis-cookie-desginer')
      const image = await Weixin.getWxacode({
        path: 'pages/desginer-detail/desginer-detail?id=' + data.id
      })

      return view.render('land/desginer/qrcode', {
        data: {
          title: '设计师',
          active: 'desginer',
          image
        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  public async create({ request, view, session }: HttpContextContract) {
    try {
      const all = request.all()
      return view.render('land/desginer/create', {
        data: {
          title: '创建作品',
          active: 'work'
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  public async edit({ params, request, view, session }: HttpContextContract) {
    try {
      const all = request.all()
      return view.render('land/desginer/edit', {
        data: {
          title: '编辑作品',
          active: 'work'
          work: await Database.from('land_works').where('id', params.id).first()
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  public async update({ view, session, request, response }: HttpContextContract) {
    try {
      const all = request.all(), data = session.get('adonis-cookie-desginer')
      switch (all.button) {
        case 'delete':
          await Database.from('land_works').where({ id: all.id, relation_desginer_id: data.relation_desginer_id }).update({ status: 0, deleted_at: Moment().format('YYYY-MM-DD HH:mm:ss') })
          break;
      }

      session.flash('message', { type: 'success', header: '操作成功', message: `` })
      return response.redirect('back')
    } catch (error) {
      console.log(error)
    }
  }

  public async save({ request, response, session }: HttpContextContract) {
    try {
      let all = request.all()
      let theme_url = all.theme_url || ''
      let data = session.get('adonis-cookie-desginer')
      if (request.file('theme')) {
        const profile = request.file('theme', { type: ['image'], size: '2mb' })
        const profileName = `${randomstring.generate(32)}.${profile.extname}`
        const profilePath = `/uploads/theme_urls/`

        let file = {}
        file.fileName = profile.clientName
        file.fileSrc = profilePath + profileName
        await profile.move(Application.publicPath(profilePath), { name: profileName, overwrite: true })

        theme_url = file.fileSrc
      }

      if (request.method() == 'POST' && all.button == 'update') {
        await Database.from('land_works').where({ id: all.id, relation_desginer_id: data.relation_desginer_id }).update({ labels: all.labels, title: all.title, area: all.area, team: all.team, introduction: all.introduction, work_time: all.work_time, location: all.location, detail: all.detail, theme_url })
        session.flash('message', { type: 'success', header: '更新成功', message: `` })
        return response.redirect('back')
      }

      const id = await Database.table('land_works').returning('id').insert({
        relation_desginer_id: data.relation_desginer_id, labels: all.labels, title: all.title, area: all.area, team: all.team, introduction: all.introduction, work_time: all.work_time, location: all.location, detail: all.detail, theme_url
      })

      session.flash('message', { type: 'success', header: '创建成功', message: `` })
      return response.redirect('back')
    } catch (error) {
      console.log(error)
      session.flash('message', { type: 'error', header: '提交失败', message: `捕获错误信息 ${ JSON.stringify(error) }。` })
    }
  }

  public async editUserinfo({ session, request, view, response }: HttpContextContract) {
    try {
      const data = session.get('adonis-cookie-desginer')
      return view.render('land/desginer/userinfo', {
        data: {
          title: '编辑设计师',
          active: 'desginer',
          desginer: await Database.from('land_desginers').where('id', data.relation_desginer_id).first()
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  public async updateUserinfo({ request, response, session }: HttpContextContract) {
    try {
      let all = request.all()
      let data = session.get('adonis-cookie-desginer')
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
        await Database.from('land_desginers').where('id', data.id).update({ catalog: all.catalog, nickname: all.nickname, labels: all.labels, detail: all.detail, avatar_url })
        session.flash('message', { type: 'success', header: '更新成功', message: `` })
        return response.redirect('back')
      }

      session.flash('message', { type: 'success', header: '创建成功', message: `` })
      return response.redirect('back')
    } catch (error) {
      console.log(error)
      session.flash('message', { type: 'error', header: '提交失败', message: `捕获错误信息 ${ JSON.stringify(error) }。` })
    }
  }
}
