import Database from '@ioc:Adonis/Lucid/Database';
import Application from '@ioc:Adonis/Core/Application';
import Moment from 'moment';
import randomstring from 'randomstring';

export default class WorkController {
  public async index({ request, response, view, session }: HttpContextContract) {
    try {
      const all = request.all(), catalog = ['其它', '办公室项目分享', '优秀案例', '设计师作品集']
      const works = await Database.from('land_works').select('id', 'catalog', 'title', 'team', 'location', 'theme_url', 'area', 'work_time', 'created_at', 'labels', 'status').where('status', all.status == 0 ? 0 : 1).andWhereNull('deleted_at').orderBy('created_at', 'desc').forPage(request.input('page', 1), 20)
      for (let index = 0; index < works.length; index++) {
        works[index].labels = works[index].labels ? works[index].labels.split(',') : []
        works[index].catalog = catalog[works[index].catalog]
        works[index].created_at = Moment(works[index].created_at).format('YYYY-MM-DD H:mm:ss')
      }

      if (all.type == 'json') {
        const works = await Database.from('land_works').select('id', 'catalog', 'title', 'team', 'location', 'theme_url', 'area', 'work_time', 'created_at', 'labels').where('status', 1).andWhereNull('deleted_at').orderBy('created_at', 'desc').forPage(request.input('page', 1), 8)
        for (let index = 0; index < works.length; index++) {
          works[index].labels = works[index].labels ? works[index].labels.split(',') : []
          works[index].catalog = catalog[works[index].catalog]
          works[index].created_at = Moment(works[index].created_at).format('YYYY-MM-DD H:mm:ss')
        }

        return response.json({
          status: 200,
          message: "ok",
          data: works
        })
      }

      return view.render('land/admin/work/index', {
        data: {
          title: '作品',
          active: 'work',
          works,
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
      return view.render('land/admin/work/create', {
        data: {
          title: '创建作品',
          active: 'work'
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
        var data = await Database.from('land_works').select('id', 'title', 'introduction', 'theme_url', 'labels').where({ status: 1, catalog: params.catalog }).where('title', 'like', `%${ all.search }%`).orderBy('created_at', 'desc').forPage(request.input('page', 1), 8)
      } else {
        var data = await Database.from('land_works').select('id', 'title', 'introduction', 'theme_url', 'labels').where({ status: 1, catalog: params.catalog }).orderBy('created_at', 'desc').forPage(request.input('page', 1), 8)
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
      const data = await Database.from('land_works').where('id', params.id).first()
      data.labels = data.labels ? data.labels.split(',') : []
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
      return view.render('land/admin/work/edit', {
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

  public async save({ request, response, session }: HttpContextContract) {
    try {
      let all = request.all()
      let theme_url = all.theme_url || ''
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
        await Database.from('land_works').where('id', all.id).update({ status: all.status, catalog: all.catalog, labels: all.labels, title: all.title, area: all.area, team: all.team, introduction: all.introduction, work_time: all.work_time, location: all.location, detail: all.detail, theme_url })
        session.flash('message', { type: 'success', header: '更新成功', message: `` })
        return response.redirect('back')
      }

      const id = await Database.table('land_works').returning('id').insert({
        status: all.status, catalog: all.catalog, labels: all.labels, title: all.title, area: all.area, team: all.team, introduction: all.introduction, work_time: all.work_time, location: all.location, detail: all.detail, theme_url
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
      await Database.from('land_works').where('id', all.id).update({ status: 0, deleted_at: Moment().format('YYYY-MM-DD HH:mm:ss') })
      session.flash('message', { type: 'success', header: '作品已删除成功！', message: `` })
      return response.redirect('back')
    } catch (error) {
      console.log(error);
    }
  }
}
