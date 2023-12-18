import Database from '@ioc:Adonis/Lucid/Database';
import Application from '@ioc:Adonis/Core/Application';
import Moment from 'moment';

export default class SearchController {
  public async index({ request, view, response }: HttpContextContract) {
    try {
      let all = request.all(), data = {
        designers: [],
        goods: [],
        works: []
      }

      if (all.search) {
        data.designers = await Database.from('land_designers').select('id', 'nickname').where({ status: 1 }).where('nickname', 'like', `%${ all.search }%`).orderBy('created_at', 'desc').forPage(request.input('page', 1), 20)
        data.goods = await Database.from('land_goods').select('id', 'good_name', 'good_brand').where('status', 1).where('good_name', 'like', `%${ all.search }%`).orWhere('good_brand', 'like', `%${ all.search }%`).orderBy('created_at', 'desc').forPage(request.input('page', 1), 20)
        data.works = await Database.from('land_works').select('id', 'title', 'introduction', 'theme_url', 'labels').where({ status: 1 }).where('title', 'like', `%${ all.search }%`).orderBy('created_at', 'desc').forPage(request.input('page', 1), 20)
        data.articles = await Database.from('land_articles').select('id', 'article_title', 'article_original_url').where({ status: 1 }).where('article_title', 'like', `%${ all.search }%`).orderBy('created_at', 'desc').forPage(request.input('page', 1), 20)
      }

      return response.json({
        status: 200,
        message: "ok",
        data
      })
    } catch (error) {
      console.log(error)
    }
  }
}
