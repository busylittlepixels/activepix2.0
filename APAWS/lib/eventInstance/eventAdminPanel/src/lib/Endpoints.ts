import { env } from '$env/dynamic/public'

let galleryDataBaseUrl: string = env.PUBLIC_API_DOMAIN//+'/prod';

let cmsBaseURL: string = "https://"+env.PUBLIC_CMS_DOMAIN + '/api';
let cmsFileBaseURL: string = "https://"+env.PUBLIC_CMS_DOMAIN;

let frontendBaseURL: string = cmsFileBaseURL.replace('://cms.', '://');
if(cmsBaseURL.includes('localhost')) {
    cmsBaseURL = 'http://'+env.PUBLIC_CMS_DOMAIN + '/api';
    cmsFileBaseURL = 'http://'+env.PUBLIC_CMS_DOMAIN;
    console.log('Using local CMS', cmsBaseURL);
}
export const Endpoints = {
    frontend: {
        base: frontendBaseURL,
    },
    galleryData: {
        baseUrl: galleryDataBaseUrl,
        forParticipant: galleryDataBaseUrl + '/forParticipant',
        manageMedia: galleryDataBaseUrl + '/manageMedia',
    },
    cms: {
        base: cmsBaseURL,
        // getUploadUrls: 'https://cms.test.races.activepix.com' + '/api/getUploadUrls',
        getUploadUrls: cmsBaseURL + '/getUploadUrls',
        users: {
            base: cmsBaseURL + '/users',
            login: cmsBaseURL + '/users/login',
            logout: cmsBaseURL + '/users/logout',
            me: cmsBaseURL + '/users/me',
            refreshToken: cmsBaseURL + '/users/refreshtoken',
        },
        media: {
            base: cmsBaseURL + '/media',
            fileBase: cmsFileBaseURL,
        },
        galleryConfig: {
            base: cmsBaseURL + '/globals/galleryconfig',
        },
        participantData: {
            base: cmsBaseURL + '/participantdata',
        },
    }
}