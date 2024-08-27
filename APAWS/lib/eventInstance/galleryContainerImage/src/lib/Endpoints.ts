let galleryDataBaseUrl: string = env.PUBLIC_API_DOMAIN;

//if galleryData ends with '/' remove it
if(galleryDataBaseUrl.endsWith('/')) {
    galleryDataBaseUrl = galleryDataBaseUrl.slice(0, -1);
}

if(process.env.NODE_ENV !== 'production') {
    galleryDataBaseUrl = 'https://du8miflkuf.execute-api.eu-west-1.amazonaws.com/prod/';
}
import { env } from '$env/dynamic/public'

let cmsBaseURL: string = "https://"+env.PUBLIC_CMS_DOMAIN;
if(cmsBaseURL.includes('localhost')) {
    cmsBaseURL = 'http://'+env.PUBLIC_CMS_DOMAIN;
    console.log('Using local CMS', cmsBaseURL);
}
export const Endpoints = {
    galleryData: {
        baseUrl: galleryDataBaseUrl,
        forParticipant: galleryDataBaseUrl + '/forParticipant',
    },
    cms: {
        users: {
            base: cmsBaseURL + '/api/users',
            login: cmsBaseURL + '/api/users/login',
            logout: cmsBaseURL + '/api/users/logout',
            me: cmsBaseURL + '/api/users/me',
            refreshToken: cmsBaseURL + '/api/users/refreshtoken',
        },
        media: {
            base: cmsBaseURL + '/api/media',
            files: cmsBaseURL,
        },
        galleryConfig: {
            base: cmsBaseURL + '/api/globals/galleryconfig',
        },
        participantData: {
            base: cmsBaseURL + '/api/participantdata',
        },
    }
}