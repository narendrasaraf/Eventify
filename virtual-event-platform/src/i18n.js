import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "welcome": "Welcome to Eventify",
            "home": "Home",
            "webinars": "Webinars",
            "conferences": "Conferences",
            "meetups": "Meetups",
            "create_event": "Create Event",
            "my_events": "My Events",
            "login": "Login",
            "signup": "Sign Up",
            "logout": "Logout",
            "launch_meeting": "Launch Meeting",
            "book_now": "Book Now",
            "pay_and_book": "Pay and Book",
            "discover_events": "Discover upcoming industry and technological events",
        }
    },
    hi: {
        translation: {
            "welcome": "Eventify में आपका स्वागत है",
            "home": "होम",
            "webinars": "वेबिनार",
            "conferences": "सम्मेलन",
            "meetups": "मिलन",
            "create_event": "ईवेंट बनाएं",
            "my_events": "मेरे ईवेंट",
            "login": "लॉगिन",
            "signup": "साइन अप",
            "logout": "लॉगआउट",
            "launch_meeting": "मीटिंग शुरू करें",
            "book_now": "अभी बुक करें",
            "pay_and_book": "भुगतान करें और बुक करें",
            "discover_events": "आगामी उद्योग और तकनीकी कार्यक्रमों की खोज करें",
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
