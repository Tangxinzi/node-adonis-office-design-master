import Database from '@ioc:Adonis/Lucid/Database';
import Application from '@ioc:Adonis/Core/Application';
import Moment from 'moment';

export default class CalculatorController {
  public async index({ request, view, response }: HttpContextContract) {
    try {
      const all = request.all()
      if (all.user_id) {
        var calculator = await Database.from('land_calculator').where({ wechat_open_id: all.user_id }).orderBy('created_at', 'desc').forPage(request.input('page', 1), 20)
      } else {
        var calculator = await Database.from('land_calculator').orderBy('created_at', 'desc').forPage(request.input('page', 1), 20)
      }
      
      for (let index = 0; index < calculator.length; index++) {
        calculator[index].estimatedNumber = JSON.parse(calculator[index].estimatedNumber)
        calculator[index].user = await Database.from('land_users').where({ wechat_open_id: calculator[index].wechat_open_id }).first() || {}
        calculator[index].created_at = Moment(calculator[index].created_at).format('YYYY-MM-DD H:mm:ss')
      }

      return view.render('land/admin/calculator/index', {
        data: {
          title: '计算器',
          active: 'calculator',
          calculator,
          all
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
}
