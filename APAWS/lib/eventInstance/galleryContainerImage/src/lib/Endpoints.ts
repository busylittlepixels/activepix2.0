let galleryDataBaseUrl: string = 'https://tlpgy1dm41.execute-api.eu-west-1.amazonaws.com/prod';


let cmsBaseURL: string = "http://localhost:80";
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
            files: cmsBaseURL + '/media/',
        },
        galleryConfig: {
            base: cmsBaseURL + '/api/globals/galleryconfig',
        },
        participantData: {
            base: cmsBaseURL + '/api/participantdata',
        },
    }
}