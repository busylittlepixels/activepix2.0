let galleryDataBaseUrl: string = 'https://tlpgy1dm41.execute-api.eu-west-1.amazonaws.com/prod';


let cmsBaseURL: string = "http://localhost:80/api";
export const Endpoints = {
    galleryData: {
        baseUrl: galleryDataBaseUrl,
        forParticipant: galleryDataBaseUrl + '/forParticipant',
    },
    cms: {
        users: {
            base: cmsBaseURL + '/users',
            login: cmsBaseURL + '/users/login',
            logout: cmsBaseURL + '/users/logout',
            me: cmsBaseURL + '/users/me',
            refreshToken: cmsBaseURL + '/users/refreshtoken',
        },
        media: {
            base: cmsBaseURL + '/media',
        },
        galleryConfig: {
            base: cmsBaseURL + '/galleryconfig',
        },
        participantData: {
            base: cmsBaseURL + '/participantdata',
        },
    }
}