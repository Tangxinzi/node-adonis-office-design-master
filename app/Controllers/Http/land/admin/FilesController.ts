import Database from '@ioc:Adonis/Lucid/Database'
import Application from '@ioc:Adonis/Core/Application'
import RandomString from 'randomstring';

export default class FilesController {
  public async upload({ request, session }: HttpContextContract) {
    try {
      if (request.file('files')) {
        let file = {}
        const profile = request.file('files', { type: ['image', 'video'], size: '100mb' })
        const profileName = `${RandomString.generate(32)}.${profile.extname}`
        const profilePath = `/uploads/files/land/`

        file.fileName = profile.clientName
        file.fileSrc = profilePath + profileName

        await profile.move(Application.publicPath(profilePath), {
          name: profileName,
          overwrite: true
        })

        return {
          errno: 0,
          data: {
            url: file.fileSrc
          }
        }
      }

      return { errno: 1, message: '' }
    } catch (e) {
      console.log(e);
      return { errno: 0, message: e }
    }
  }
}
