let galleryDataBaseUrl: string = env.PUBLIC_API_DOMAIN ?? ""

//if galleryData ends with '/' remove it
if(galleryDataBaseUrl.endsWith('/')) {
    galleryDataBaseUrl = galleryDataBaseUrl.slice(0, -1);
}
//if galleryData does not start with 'http' add it
if (!galleryDataBaseUrl.startsWith('http')) {
    galleryDataBaseUrl = 'https://' + galleryDataBaseUrl;
}

if(process.env.NODE_ENV !== 'production') {
    galleryDataBaseUrl = 'https://api.test4.races.activepix.com';
}
import { env } from '$env/dynamic/public'

let cmsBaseURL: string = "https://"+env.PUBLIC_CMS_DOMAIN;
//Frontend is cmsBaseURL without cms. prefix.

//Dev stuff
if(process.env.NODE_ENV !== 'production') {
    cmsBaseURL = 'https://cms.test4.races.activepix.com';
}

let frontendBaseURL: string = cmsBaseURL.replace('://cms.', '://');
if(cmsBaseURL.includes('localhost')) {
    cmsBaseURL = 'http://'+env.PUBLIC_CMS_DOMAIN;
    console.log('Using local CMS', cmsBaseURL);
}
export const Endpoints = {
    frontend: {
        base: frontendBaseURL,
    },
    galleryData: {
        baseUrl: galleryDataBaseUrl,
        forParticipant: galleryDataBaseUrl + '/forParticipant',
        downloadGalleryZip: galleryDataBaseUrl + '/downloadGalleryZip',
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