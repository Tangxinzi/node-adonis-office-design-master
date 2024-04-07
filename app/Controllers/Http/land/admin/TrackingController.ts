import Database from '@ioc:Adonis/Lucid/Database'
import Moment from 'moment'
Moment.locale('zh-cn')

export default class TrackingController {
  public async eventTracking({ request, response, view, session }: HttpContextContract) {
    try {
      const all = request.all()
      const tracking = await Database.from('land_tracking').where({ type: 'odm' }).orderBy('created_at', 'desc').forPage(request.input('page', 1), 20)
      
      for (let index = 0; index < tracking.length; index++) {
        tracking[index].content = JSON.parse(tracking[index].content)
        tracking[index].created_at = Moment(tracking[index].created_at).format('YYYY-MM-DD HH:mm:ss')
      }

      return view.render('land/admin/event-tracking/odm', {
        data: {
          title: '[ODM] 营销表单信息流程',
          active: 'odm',
          tracking,
          all
        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  public async odm({ request, response, session }: HttpContextContract) {
    try {
      const all = request.all()   
      console.log(all);
         
      const id = await Database.table('land_tracking').insert({ 
        type: 'odm', 
        content: JSON.stringify(all) 
      })

      if (id.length) {
        response.json({ status: 200, message: "ok" })
      }
    } catch (error) {
      console.log(error);
    }
  }
}
