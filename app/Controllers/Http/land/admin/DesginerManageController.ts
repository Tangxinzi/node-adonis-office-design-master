import Database from '@ioc:Adonis/Lucid/Database';
import Application from '@ioc:Adonis/Core/Application';
import Moment from 'moment';
import randomstring from 'randomstring';

export default class DesginerManageController {
  public async manage({ request, view, session }: HttpContextContract) {
    try {
      const data = session.get('adonis-cookie-desginer')
      data.desginer = await Database.from('land_desginers').where({ status: 1, id: data.desginer_relation_id }).first() || {}
      data.works = await Database.from('land_works').select('id', 'title', 'labels', 'theme_url', 'work_time').where('status', 1).whereIn('id', data.desginer.works ? data.desginer.works.split(',') : [])
      console.log(data);

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

  public async desginerSave({ view, session, request, response }: HttpContextContract) {
    try {
      const all = request.all()
      console.log(all);

      switch (all.button) {
        case 'add':
          await Database.table('land_desginers_manage').insert({
            desginer_relation_id: all.desginer_relation_id,
            desginer_name_login: all.desginer_name_login,
            desginer_name_password: all.desginer_name_password,
            status: parseInt(all.status || 0),
          })
          break;
        case 'save':
          await Database.from('land_desginers_manage').where({ id: all.id }).update({
            desginer_relation_id: all.desginer_relation_id,
            desginer_name_login: all.desginer_name_login,
            desginer_name_password: all.desginer_name_password,
            status: parseInt(all.status || 0),
          })
          break;
        case 'delete':
          await Database.from('land_desginers_manage').where('id', all.id).update({ status: 0, deleted_at: Moment().format('YYYY-MM-DD HH:mm:ss') })
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
        await Database.from('land_works').where('id', all.id).update({ catalog: all.catalog, labels: all.labels, title: all.title, area: all.area, team: all.team, introduction: all.introduction, work_time: all.work_time, location: all.location, detail: all.detail, theme_url })
        session.flash('message', { type: 'success', header: '更新成功', message: `` })
        return response.redirect('back')
      }

      const id = await Database.table('land_works').returning('id').insert({
        catalog: all.catalog, labels: all.labels, title: all.title, area: all.area, team: all.team, introduction: all.introduction, work_time: all.work_time, location: all.location, detail: all.detail, theme_url
      })

      session.flash('message', { type: 'success', header: '创建成功', message: `` })
      return response.redirect('back')
    } catch (error) {
      console.log(error)
      session.flash('message', { type: 'error', header: '提交失败', message: `捕获错误信息 ${ JSON.stringify(error) }。` })
    }
  }
}
