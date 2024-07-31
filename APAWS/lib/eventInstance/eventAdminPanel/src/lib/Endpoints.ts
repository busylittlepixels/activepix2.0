import { base } from "$service-worker";

let galleryDataBaseUrl: string = 'https://tlpgy1dm41.execute-api.eu-west-1.amazonaws.com/prod';

let cmsBaseURL: string = "localhost:80/api";
export const Endpoints = {
    galleryData: {
        baseUrl: galleryDataBaseUrl,
        forParticipant: galleryDataBaseUrl + '/forParticipant',
    },
    cms: {
        media: {
            base: cmsBaseURL + '/media',
        },
        galleryConfig: {
            base: cmsBaseURL + '/galleryconfig',
        }
    }
}