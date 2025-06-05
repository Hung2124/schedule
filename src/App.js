import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut, 
    GoogleAuthProvider,
    signInWithPopup,
    signInWithCustomToken
} from 'firebase/auth'; 
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyDZoaE_JCVg9DjnfCOBalMTdBcaRERNT1Q",
  authDomain: "thoikhoabieuapp-d9a8e.firebaseapp.com",
  projectId: "thoikhoabieuapp-d9a8e",
  storageBucket: "thoikhoabieuapp-d9a8e.appspot.com", 
  messagingSenderId: "943435788230",
  appId: "1:943435788230:web:cb2ac9140236aac7a50cc7",
  measurementId: "G-SL7D9QZRD5"
};

// --- Initialize Firebase ---
let app;
let db;
let auth;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("Firebase initialized successfully using EXPLICIT Project ID:", firebaseConfig.projectId);
} catch (error) {
    console.error("Error initializing Firebase:", error);
}

const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-timetable-app-react';

// --- Contexts ---
const AuthContext = createContext();
const SettingsContext = createContext();
const ScheduleContext = createContext();

// --- Initial Data ---
const initialScheduleData = {
    name: "Lịch học của tôi", 
    timeSlots: [
        { time: "5:00 - 5:40", activities: [
            { day: "Thứ Hai", activityName: "Review Toán", details: "(học 25p, nghỉ 5p x 1, nghỉ dài 10p)", icon: "fas fa-book-open", colorKey: "toan_review", isCompleted: false, quickNote: "" },
            { day: "Thứ Ba", activityName: "Review Hán ngữ", details: "(học 25p, nghỉ 5p x 1, nghỉ dài 10p)", icon: "fas fa-landmark", colorKey: "han_ngu_review", isCompleted: false, quickNote: "" },
            { day: "Thứ Tư", activityName: "Review Toán", details: "(học 25p, nghỉ 5p x 1, nghỉ dài 10p)", icon: "fas fa-book-open", colorKey: "toan_review", isCompleted: false, quickNote: "" },
            { day: "Thứ Năm", activityName: "Review Hán ngữ", details: "(học 25p, nghỉ 5p x 1, nghỉ dài 10p)", icon: "fas fa-landmark", colorKey: "han_ngu_review", isCompleted: false, quickNote: "" },
            { day: "Thứ Sáu", activityName: "Review Toán", details: "(học 25p, nghỉ 5p x 1, nghỉ dài 10p)", icon: "fas fa-book-open", colorKey: "toan_review", isCompleted: false, quickNote: "" },
            { day: "Thứ Bảy", activityName: "Review Tiếng Nhật", details: "(học 25p, nghỉ 5p x 1, nghỉ dài 10p)", icon: "fas fa-torii-gate", colorKey: "tieng_nhat_review", isCompleted: false, quickNote: "" },
            { day: "Chủ Nhật", activityName: "Review Tiếng Nhật", details: "(học 25p, nghỉ 5p x 1, nghỉ dài 10p)", icon: "fas fa-torii-gate", colorKey: "tieng_nhat_review", isCompleted: false, quickNote: "" },
        ]},
        { time: "5:40 - 6:00", activities: [
            { day: "Thứ Hai", activityName: "Tiếng Nhật", details: "(học 20p)", icon: "fas fa-torii-gate", colorKey: "tieng_nhat", isCompleted: false, quickNote: "" },
            { day: "Thứ Ba", activityName: "Tiếng Nhật", details: "(học 20p)", icon: "fas fa-torii-gate", colorKey: "tieng_nhat", isCompleted: false, quickNote: "" },
            { day: "Thứ Tư", activityName: "Tiếng Nhật", details: "(học 20p)", icon: "fas fa-torii-gate", colorKey: "tieng_nhat", isCompleted: false, quickNote: "" },
            { day: "Thứ Năm", activityName: "Tiếng Nhật", details: "(học 20p)", icon: "fas fa-torii-gate", colorKey: "tieng_nhat", isCompleted: false, quickNote: "" },
            { day: "Thứ Sáu", activityName: "Tiếng Nhật", details: "(học 20p)", icon: "fas fa-torii-gate", colorKey: "tieng_nhat", isCompleted: false, quickNote: "" },
            { day: "Thứ Bảy", activityName: "Review Code", details: "(học 20p)", icon: "fas fa-laptop-code", colorKey: "code_review", isCompleted: false, quickNote: "" },
            { day: "Chủ Nhật", activityName: "Review Code", details: "(học 20p)", icon: "fas fa-laptop-code", colorKey: "code_review", isCompleted: false, quickNote: "" },
        ]},
        { time: "6:00 - 6:30", activities: [
            { day: "Thứ Hai", activityName: "Ăn sáng", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
            { day: "Thứ Ba", activityName: "Ăn sáng", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
            { day: "Thứ Tư", activityName: "Ăn sáng", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
            { day: "Thứ Năm", activityName: "Ăn sáng", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
            { day: "Thứ Sáu", activityName: "Ăn sáng", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
            { day: "Thứ Bảy", activityName: "Ăn sáng", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
            { day: "Chủ Nhật", activityName: "Ăn sáng", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
        ]},
        { time: "6:30 - 8:30", activities: [
            { day: "Thứ Hai", activityName: "Tiếng Nhật", details: "(học 25p, nghỉ 5p x 4, nghỉ dài 15p)", icon: "fas fa-torii-gate", colorKey: "tieng_nhat", isCompleted: false, quickNote: "" },
            { day: "Thứ Ba", activityName: "Tiếng Nhật", details: "(học 25p, nghỉ 5p x 4, nghỉ dài 15p)", icon: "fas fa-torii-gate", colorKey: "tieng_nhat", isCompleted: false, quickNote: "" },
            { day: "Thứ Tư", activityName: "Tiếng Nhật", details: "(học 25p, nghỉ 5p x 4, nghỉ dài 15p)", icon: "fas fa-torii-gate", colorKey: "tieng_nhat", isCompleted: false, quickNote: "" },
            { day: "Thứ Năm", activityName: "Tiếng Nhật", details: "(học 25p, nghỉ 5p x 4, nghỉ dài 15p)", icon: "fas fa-torii-gate", colorKey: "tieng_nhat", isCompleted: false, quickNote: "" },
            { day: "Thứ Sáu", activityName: "Tiếng Nhật", details: "(học 25p, nghỉ 5p x 4, nghỉ dài 15p)", icon: "fas fa-torii-gate", colorKey: "tieng_nhat", isCompleted: false, quickNote: "" },
            { day: "Thứ Bảy", activityName: "Review Tiếng Anh + CSD", details: "(học 25p, nghỉ 5p x 2, nghỉ dài 60p)", icon: "fas fa-spell-check", colorKey: "english_csd_review", isCompleted: false, quickNote: "" },
            { day: "Chủ Nhật", activityName: "Review Tiếng Anh + CSD", details: "(học 25p, nghỉ 5p x 2, nghỉ dài 60p)", icon: "fas fa-spell-check", colorKey: "english_csd_review", isCompleted: false, quickNote: "" },
        ]},
        { time: "8:30 - 10:15", activities: [
            { day: "Thứ Hai", activityName: "Code", details: "(học 25p, nghỉ 5p x 3, nghỉ dài 15p)", icon: "fas fa-laptop-code", colorKey: "code", isCompleted: false, quickNote: "" },
            { day: "Thứ Ba", activityName: "Code", details: "(học 25p, nghỉ 5p x 3, nghỉ dài 15p)", icon: "fas fa-laptop-code", colorKey: "code", isCompleted: false, quickNote: "" },
            { day: "Thứ Tư", activityName: "Code", details: "(học 25p, nghỉ 5p x 3, nghỉ dài 15p)", icon: "fas fa-laptop-code", colorKey: "code", isCompleted: false, quickNote: "" },
            { day: "Thứ Năm", activityName: "Code", details: "(học 25p, nghỉ 5p x 3, nghỉ dài 15p)", icon: "fas fa-laptop-code", colorKey: "code", isCompleted: false, quickNote: "" },
            { day: "Thứ Sáu", activityName: "Code", details: "(học 25p, nghỉ 5p x 3, nghỉ dài 15p)", icon: "fas fa-laptop-code", colorKey: "code", isCompleted: false, quickNote: "" },
            { day: "Thứ Bảy", activityName: "Review Toán", details: "(học 25p, nghỉ 5p x 2, nghỉ dài 30p)", icon: "fas fa-calculator", colorKey: "toan_review", isCompleted: false, quickNote: "" },
            { day: "Chủ Nhật", activityName: "Review Hán ngữ", details: "(học 25p, nghỉ 5p x 2, nghỉ dài 30p)", icon: "fas fa-landmark", colorKey: "han_ngu_review", isCompleted: false, quickNote: "" },
        ]},
        { time: "10:15 - 12:00", activities: [
            { day: "Thứ Hai", activityName: "English", details: "(học 25p, nghỉ 5p x 3, nghỉ dài 15p)", icon: "fas fa-language", colorKey: "english", isCompleted: false, quickNote: "" },
            { day: "Thứ Ba", activityName: "CSD", details: "(học 25p, nghỉ 5p x 3, nghỉ dài 15p)", icon: "fas fa-microchip", colorKey: "csd", isCompleted: false, quickNote: "" },
            { day: "Thứ Tư", activityName: "English", details: "(học 25p, nghỉ 5p x 3, nghỉ dài 15p)", icon: "fas fa-language", colorKey: "english", isCompleted: false, quickNote: "" },
            { day: "Thứ Năm", activityName: "CSD", details: "(học 25p, nghỉ 5p x 3, nghỉ dài 15p)", icon: "fas fa-microchip", colorKey: "csd", isCompleted: false, quickNote: "" },
            { day: "Thứ Sáu", activityName: "English", details: "(học 25p, nghỉ 5p x 3, nghỉ dài 15p)", icon: "fas fa-language", colorKey: "english", isCompleted: false, quickNote: "" },
            { day: "Thứ Bảy", activityName: "Review Hán ngữ", details: "(học 25p, nghỉ 5p x 2, nghỉ dài 30p)", icon: "fas fa-landmark", colorKey: "han_ngu_review", isCompleted: false, quickNote: "" },
            { day: "Chủ Nhật", activityName: "Review Toán", details: "(học 25p, nghỉ 5p x 2, nghỉ dài 30p)", icon: "fas fa-calculator", colorKey: "toan_review", isCompleted: false, quickNote: "" },
        ]},
        { time: "12:00 - 13:00", activities: [
            { day: "Thứ Hai", activityName: "Ăn trưa", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
            { day: "Thứ Ba", activityName: "Ăn trưa", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
            { day: "Thứ Tư", activityName: "Ăn trưa", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
            { day: "Thứ Năm", activityName: "Ăn trưa", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
            { day: "Thứ Sáu", activityName: "Ăn trưa", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
            { day: "Thứ Bảy", activityName: "Ăn trưa", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
            { day: "Chủ Nhật", activityName: "Ăn trưa", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
        ]},
        { time: "13:00 - 15:00", activities: [
            { day: "Thứ Hai", activityName: "Toán", details: "(học 25p, nghỉ 5p x 4, nghỉ dài 15p)", icon: "fas fa-calculator", colorKey: "toan", isCompleted: false, quickNote: "" },
            { day: "Thứ Ba", activityName: "Hán ngữ", details: "(học 25p, nghỉ 5p x 4, nghỉ dài 15p)", icon: "fas fa-landmark", colorKey: "han_ngu", isCompleted: false, quickNote: "" },
            { day: "Thứ Tư", activityName: "Toán", details: "(học 25p, nghỉ 5p x 4, nghỉ dài 15p)", icon: "fas fa-calculator", colorKey: "toan", isCompleted: false, quickNote: "" },
            { day: "Thứ Năm", activityName: "Hán ngữ", details: "(học 25p, nghỉ 5p x 4, nghỉ dài 15p)", icon: "fas fa-landmark", colorKey: "han_ngu", isCompleted: false, quickNote: "" },
            { day: "Thứ Sáu", activityName: "Toán", details: "(học 25p, nghỉ 5p x 4, nghỉ dài 15p)", icon: "fas fa-calculator", colorKey: "toan", isCompleted: false, quickNote: "" },
            { day: "Thứ Bảy", activityName: "Gợi nhớ chủ động", details: "(Tất cả môn, học 25p, nghỉ 5p x 2, nghỉ dài 60p)", icon: "fas fa-brain", colorKey: "goi_nho", isCompleted: false, quickNote: "" },
            { day: "Chủ Nhật", activityName: "Gợi nhớ chủ động", details: "(Tất cả môn, học 25p, nghỉ 5p x 2, nghỉ dài 60p)", icon: "fas fa-brain", colorKey: "goi_nho", isCompleted: false, quickNote: "" },
        ]},
        { time: "15:00 - 17:00", activities: [
            { day: "Thứ Hai", activityName: "AIO", details: "(học 25p, nghỉ 5p x 4, nghỉ dài 15p)", icon: "fas fa-users", colorKey: "aio", isCompleted: false, quickNote: "" },
            { day: "Thứ Ba", activityName: "AIO", details: "(học 25p, nghỉ 5p x 4, nghỉ dài 15p)", icon: "fas fa-users", colorKey: "aio", isCompleted: false, quickNote: "" },
            { day: "Thứ Tư", activityName: "AIO", details: "(học 25p, nghỉ 5p x 4, nghỉ dài 15p)", icon: "fas fa-users", colorKey: "aio", isCompleted: false, quickNote: "" },
            { day: "Thứ Năm", activityName: "AIO", details: "(học 25p, nghỉ 5p x 4, nghỉ dài 15p)", icon: "fas fa-users", colorKey: "aio", isCompleted: false, quickNote: "" },
            { day: "Thứ Sáu", activityName: "AIO", details: "(học 25p, nghỉ 5p x 4, nghỉ dài 15p)", icon: "fas fa-users", colorKey: "aio", isCompleted: false, quickNote: "" },
            { day: "Thứ Bảy", activityName: "Nghỉ ngơi/Thư giãn", details: "", icon: "fas fa-couch", colorKey: "rest", isCompleted: false, quickNote: "" },
            { day: "Chủ Nhật", activityName: "Nghỉ ngơi/Thư giãn", details: "", icon: "fas fa-couch", colorKey: "rest", isCompleted: false, quickNote: "" },
        ]},
        { time: "17:00 - 18:00", activities: [
            { day: "Thứ Hai", activityName: "Thể dục + Tắm", details: "", icon: "fas fa-dumbbell", colorKey: "exercise", isCompleted: false, quickNote: "" },
            { day: "Thứ Ba", activityName: "Thể dục + Tắm", details: "", icon: "fas fa-dumbbell", colorKey: "exercise", isCompleted: false, quickNote: "" },
            { day: "Thứ Tư", activityName: "Thể dục + Tắm", details: "", icon: "fas fa-dumbbell", colorKey: "exercise", isCompleted: false, quickNote: "" },
            { day: "Thứ Năm", activityName: "Thể dục + Tắm", details: "", icon: "fas fa-dumbbell", colorKey: "exercise", isCompleted: false, quickNote: "" },
            { day: "Thứ Sáu", activityName: "Thể dục + Tắm", details: "", icon: "fas fa-dumbbell", colorKey: "exercise", isCompleted: false, quickNote: "" },
            { day: "Thứ Bảy", activityName: "Thể dục + Tắm", details: "", icon: "fas fa-dumbbell", colorKey: "exercise", isCompleted: false, quickNote: "" },
            { day: "Chủ Nhật", activityName: "Thể dục + Tắm", details: "", icon: "fas fa-dumbbell", colorKey: "exercise", isCompleted: false, quickNote: "" },
        ]},
        { time: "18:00 - 19:00", activities: [
            { day: "Thứ Hai", activityName: "Ăn tối", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
            { day: "Thứ Ba", activityName: "Ăn tối", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
            { day: "Thứ Tư", activityName: "Ăn tối", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
            { day: "Thứ Năm", activityName: "Ăn tối", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
            { day: "Thứ Sáu", activityName: "Ăn tối", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
            { day: "Thứ Bảy", activityName: "Ăn tối", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
            { day: "Chủ Nhật", activityName: "Ăn tối", details: "", icon: "fas fa-utensils", colorKey: "meal", isCompleted: false, quickNote: "" },
        ]},
        { time: "19:00 - 20:00", activities: [
            { day: "Thứ Hai", activityName: "AIO", details: "(học 25p, nghỉ 5p x 2, nghỉ dài 15p)", icon: "fas fa-users", colorKey: "aio", isCompleted: false, quickNote: "" },
            { day: "Thứ Ba", activityName: "AIO", details: "(học 25p, nghỉ 5p x 2, nghỉ dài 15p)", icon: "fas fa-users", colorKey: "aio", isCompleted: false, quickNote: "" },
            { day: "Thứ Tư", activityName: "AIO", details: "(học 25p, nghỉ 5p x 2, nghỉ dài 15p)", icon: "fas fa-users", colorKey: "aio", isCompleted: false, quickNote: "" },
            { day: "Thứ Năm", activityName: "AIO", details: "(học 25p, nghỉ 5p x 2, nghỉ dài 15p)", icon: "fas fa-users", colorKey: "aio", isCompleted: false, quickNote: "" },
            { day: "Thứ Sáu", activityName: "AIO", details: "(học 25p, nghỉ 5p x 2, nghỉ dài 15p)", icon: "fas fa-users", colorKey: "aio", isCompleted: false, quickNote: "" },
            { day: "Thứ Bảy", activityName: "AIO", details: "(học 25p, nghỉ 5p x 2, nghỉ dài 15p)", icon: "fas fa-users", colorKey: "aio", isCompleted: false, quickNote: "" },
            { day: "Chủ Nhật", activityName: "AIO", details: "(học 25p, nghỉ 5p x 2, nghỉ dài 15p)", icon: "fas fa-users", colorKey: "aio", isCompleted: false, quickNote: "" },
        ]},
        { time: "20:00 - 23:00", activities: [
            { day: "Thứ Hai", activityName: "AIO (học qua Meet)", details: "(Liên tục 3h)", icon: "fas fa-chalkboard-teacher", colorKey: "aio_meet", isCompleted: false, quickNote: "" },
            { day: "Thứ Ba", activityName: "AIO (học qua Meet)", details: "(Liên tục 3h)", icon: "fas fa-chalkboard-teacher", colorKey: "aio_meet", isCompleted: false, quickNote: "" },
            { day: "Thứ Tư", activityName: "AIO (học qua Meet)", details: "(Liên tục 3h)", icon: "fas fa-chalkboard-teacher", colorKey: "aio_meet", isCompleted: false, quickNote: "" },
            { day: "Thứ Năm", activityName: "AIO (học qua Meet)", details: "(Liên tục 3h)", icon: "fas fa-chalkboard-teacher", colorKey: "aio_meet", isCompleted: false, quickNote: "" },
            { day: "Thứ Sáu", activityName: "AIO (học qua Meet)", details: "(Liên tục 3h)", icon: "fas fa-chalkboard-teacher", colorKey: "aio_meet", isCompleted: false, quickNote: "" },
            { day: "Thứ Bảy", activityName: "Nghỉ ngơi/Thư giãn", details: "", icon: "fas fa-couch", colorKey: "rest", isCompleted: false, quickNote: "" },
            { day: "Chủ Nhật", activityName: "Nghỉ ngơi/Thư giãn", details: "", icon: "fas fa-couch", colorKey: "rest", isCompleted: false, quickNote: "" },
        ]},
    ]
};

const defaultSettings = {
    darkMode: false,
    scheduleName: "Lịch học của tôi", 
    subjectColors: {
        toan_review: { bg: 'bg-green-100 dark:bg-green-700', text: 'text-green-800 dark:text-green-200', border: 'border-green-500' },
        han_ngu_review: { bg: 'bg-yellow-100 dark:bg-yellow-700', text: 'text-yellow-800 dark:text-yellow-200', border: 'border-yellow-500' },
        tieng_nhat_review: { bg: 'bg-sky-100 dark:bg-sky-700', text: 'text-sky-800 dark:text-sky-200', border: 'border-sky-500' },
        code_review: { bg: 'bg-pink-100 dark:bg-pink-700', text: 'text-pink-800 dark:text-pink-200', border: 'border-pink-500' },
        english_csd_review: { bg: 'bg-violet-100 dark:bg-violet-700', text: 'text-violet-800 dark:text-violet-200', border: 'border-violet-500' },
        tieng_nhat: { bg: 'bg-rose-200 dark:bg-rose-600', text: 'text-rose-800 dark:text-rose-100', border: 'border-rose-500' },
        toan: { bg: 'bg-teal-200 dark:bg-teal-600', text: 'text-teal-800 dark:text-teal-100', border: 'border-teal-500' },
        han_ngu: { bg: 'bg-red-200 dark:bg-red-600', text: 'text-red-800 dark:text-red-100', border: 'border-red-500' },
        code: { bg: 'bg-blue-200 dark:bg-blue-600', text: 'text-blue-800 dark:text-blue-100', border: 'border-blue-500' },
        csd: { bg: 'bg-gray-300 dark:bg-gray-600', text: 'text-gray-800 dark:text-gray-100', border: 'border-gray-500' },
        english: { bg: 'bg-purple-200 dark:bg-purple-600', text: 'text-purple-800 dark:text-purple-100', border: 'border-purple-500' },
        aio: { bg: 'bg-emerald-200 dark:bg-emerald-600', text: 'text-emerald-800 dark:text-emerald-100', border: 'border-emerald-500' },
        aio_meet: { bg: 'bg-cyan-200 dark:bg-cyan-600', text: 'text-cyan-800 dark:text-cyan-100', border: 'border-cyan-500' },
        meal: { bg: 'bg-orange-200 dark:bg-orange-600', text: 'text-orange-800 dark:text-orange-100', border: 'border-orange-500' },
        rest: { bg: 'bg-lime-200 dark:bg-lime-600', text: 'text-lime-800 dark:text-lime-100', border: 'border-lime-500' },
        exercise: { bg: 'bg-amber-200 dark:bg-amber-600', text: 'text-amber-800 dark:text-amber-100', border: 'border-amber-500' },
        goi_nho: { bg: 'bg-indigo-200 dark:bg-indigo-600', text: 'text-indigo-800 dark:text-indigo-100', border: 'border-indigo-500' },
        default: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', border: 'border-gray-400' }
    }
};

const inspirationalQuotes = [
    "Cách tốt nhất để dự đoán tương lai là tạo ra nó. - Peter Drucker",
    "Học tập không phải là sự chuẩn bị cho cuộc sống; học tập chính là cuộc sống. - John Dewey",
    "Thất bại duy nhất là không cố gắng.",
    "Hãy là sự thay đổi mà bạn muốn thấy trong thế giới. - Mahatma Gandhi",
    "Không bao giờ là quá muộn để trở thành người mà bạn lẽ ra có thể trở thành. - George Eliot"
];

// --- Hooks ---
const useAuth = () => useContext(AuthContext);
const useSettings = () => useContext(SettingsContext);
const useSchedule = () => useContext(ScheduleContext);

// --- Provider Components ---
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        if (!auth) {
            console.warn("AuthProvider: Firebase Auth is not initialized.");
            setLoadingAuth(false);
            return;
        }
        console.log("AuthProvider: Setting up onAuthStateChanged listener.");
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log("AuthProvider: onAuthStateChanged triggered. firebaseUser:", firebaseUser ? firebaseUser.uid : null);
            if (firebaseUser) {
                setUser(firebaseUser);
                console.log("AuthProvider: User is signed in:", firebaseUser.uid, "isAnonymous:", firebaseUser.isAnonymous);
                setLoadingAuth(false);
            } else {
                console.log("AuthProvider: No current Firebase user.");
                setLoadingAuth(false); 
            }
        });

        if (typeof window.__initial_auth_token !== 'undefined' && window.__initial_auth_token) {
            console.log("AuthProvider: __initial_auth_token present. Attempting signInWithCustomToken on mount.");
            setLoadingAuth(true); 
            signInWithCustomToken(auth, window.__initial_auth_token)
                .then(() => {
                    console.log("AuthProvider: signInWithCustomToken potentially successful, onAuthStateChanged will confirm.");
                })
                .catch(error => {
                    console.error("AuthProvider: Error with signInWithCustomToken on mount:", error.code, error.message);
                    setUser(null);
                    setLoadingAuth(false);
                });
        } else {
            setLoadingAuth(false); 
        }

        return () => {
            console.log("AuthProvider: Unsubscribing from onAuthStateChanged.");
            unsubscribe();
        };
    }, []);


    const handleSignOut = async () => {
        if (!auth) {
            console.warn("AuthProvider: Firebase Auth is not initialized. Cannot sign out.");
            return;
        }
        try {
            console.log("AuthProvider: Attempting to sign out user...");
            await signOut(auth);
            setUser(null); 
            console.log("AuthProvider: User signed out successfully. Navbar should show Google Sign-In.");
        } catch (error) {
            console.error("AuthProvider: Error signing out:", error);
        }
    };

    const handleGoogleSignIn = async () => {
        if (!auth) {
            console.warn("AuthProvider: Firebase Auth is not initialized for Google Sign-In.");
            return;
        }
        const provider = new GoogleAuthProvider();
        try {
            console.log("AuthProvider: Attempting Google Sign-In.");
            setLoadingAuth(true); 
            await signInWithPopup(auth, provider);
            console.log("AuthProvider: Google Sign-In popup initiated. Waiting for onAuthStateChanged.");
        } catch (error) {
            console.error("AuthProvider: Error during Google Sign-In (full error object):", error);
            setLoadingAuth(false); 
            if (error.code === 'auth/unauthorized-domain') {
                 console.error("Lỗi đăng nhập Google: Tên miền chưa được ủy quyền. Vui lòng thêm tên miền của ứng dụng này (ví dụ: " + window.location.hostname + ") vào danh sách 'Authorized domains' trong cài đặt Firebase Authentication của dự án 'thoikhoabieuapp-d9a8e'.");
            } else if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
                 console.error("Lỗi đăng nhập Google: " + error.message + (error.customData ? ` (${JSON.stringify(error.customData)})` : ''));
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, loadingAuth, handleSignOut, handleGoogleSignIn }}>
            {children}
        </AuthContext.Provider>
    );
};

const SettingsProvider = ({ children }) => {
    const { user } = useAuth();
    const [settings, setSettings] = useState(defaultSettings);
    const [loadingSettings, setLoadingSettings] = useState(true);

    const loadSettings = useCallback(async (currentUser) => {
        if (currentUser && db) {
            setLoadingSettings(true);
            const settingsRef = doc(db, `users/${currentUser.uid}/preferences`, 'userSettings');
            try {
                const docSnap = await getDoc(settingsRef);
                if (docSnap.exists()) {
                    const loadedSettings = docSnap.data();
                    setSettings(prev => ({ 
                        ...defaultSettings, 
                        ...loadedSettings, 
                        subjectColors: {...defaultSettings.subjectColors, ...(loadedSettings.subjectColors || {})} 
                    }));
                } else {
                    await setDoc(settingsRef, defaultSettings);
                    setSettings(defaultSettings);
                }
            } catch (error) {
                console.error("Error loading settings:", error);
                setSettings(defaultSettings);
            } finally {
                setLoadingSettings(false);
            }
        } else {
            setSettings(defaultSettings);
            setLoadingSettings(false);
        }
    }, []);

    useEffect(() => {
        if (user) { 
            loadSettings(user);
        } else { 
            setSettings(defaultSettings);
            setLoadingSettings(false);
        }
    }, [user, loadSettings]);
    
    useEffect(() => {
        document.documentElement.classList.toggle('dark', settings.darkMode);
    }, [settings.darkMode]);

    const updateSettings = async (newSettingsPartial) => {
        const newSettings = {...settings, ...newSettingsPartial};
        if (user && db) {
            const settingsRef = doc(db, `users/${user.uid}/preferences`, 'userSettings');
            try {
                await setDoc(settingsRef, newSettings, { merge: true });
                setSettings(newSettings);
            } catch (error) {
                console.error("Error updating settings:", error);
            }
        } else {
            setSettings(newSettings);
        }
    };
    
    const toggleDarkMode = () => {
        updateSettings({ darkMode: !settings.darkMode });
    };

    const updateSubjectColor = (subjectKey, colorProperties) => {
        const newColors = { ...settings.subjectColors, [subjectKey]: colorProperties };
        updateSettings({ subjectColors: newColors });
    };
     const updateScheduleNameInSettings = (newName) => { 
        updateSettings({ scheduleName: newName });
    };

    return (
        <SettingsContext.Provider value={{ settings, loadingSettings, updateSettings, toggleDarkMode, updateSubjectColor, updateScheduleNameInSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

const ScheduleProvider = ({ children }) => {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState(initialScheduleData);
    const [loadingSchedule, setLoadingSchedule] = useState(true);
    const scheduleId = "mainSchedule"; 

    const loadSchedule = useCallback(async (currentUser) => {
        if (currentUser && db) {
            setLoadingSchedule(true);
            const scheduleRef = doc(db, `users/${currentUser.uid}/schedules`, scheduleId);
            try {
                const docSnap = await getDoc(scheduleRef);
                if (docSnap.exists()) {
                    setSchedule(prev => ({...initialScheduleData, ...docSnap.data()}));
                } else {
                    await setDoc(scheduleRef, initialScheduleData);
                    setSchedule(initialScheduleData);
                }
            } catch (error) {
                console.error("Error loading schedule:", error);
                setSchedule(initialScheduleData);
            } finally {
                setLoadingSchedule(false);
            }
        } else {
            setSchedule(initialScheduleData);
            setLoadingSchedule(false);
        }
    }, [scheduleId]);

    useEffect(() => {
        if (user) { 
            loadSchedule(user);
        } else { 
            setSchedule(initialScheduleData);
            setLoadingSchedule(false);
        }
    }, [user, loadSchedule]);

    const updateActivity = async (timeSlotIndex, activityIndex, updatedActivityData) => {
        const newTimeSlots = schedule.timeSlots.map((ts, tsIdx) => {
            if (tsIdx === timeSlotIndex) {
                return {
                    ...ts,
                    activities: ts.activities.map((act, actIdx) => 
                        actIdx === activityIndex ? { ...act, ...updatedActivityData } : act
                    )
                };
            }
            return ts;
        });
        const updatedSchedule = { ...schedule, timeSlots: newTimeSlots };
        setSchedule(updatedSchedule); 

        if (user && db) {
            const scheduleRef = doc(db, `users/${user.uid}/schedules`, scheduleId);
            try {
                await setDoc(scheduleRef, updatedSchedule, { merge: true });
            } catch (error) {
                console.error("Error updating activity in Firestore:", error);
            }
        }
    };

    const updateScheduleName = async (newName) => {
        const updatedSchedule = { ...schedule, name: newName };
        setSchedule(updatedSchedule);
        if (user && db) {
            const scheduleRef = doc(db, `users/${user.uid}/schedules`, scheduleId);
            try {
                await updateDoc(scheduleRef, { name: newName });
            } catch (error) {
                console.error("Error updating schedule name in Firestore:", error);
            }
        }
    };
    
    return (
        <ScheduleContext.Provider value={{ schedule, loadingSchedule, updateActivity, setSchedule, updateScheduleName }}>
            {children}
        </ScheduleContext.Provider>
    );
};


// --- Components ---
const HanoiClock = () => {
    const [time, setTime] = useState("");

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const hanoiTime = new Intl.DateTimeFormat('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'Asia/Ho_Chi_Minh',
                hour12: false
            }).format(now);
            setTime(hanoiTime);
        };
        updateClock();
        const intervalId = setInterval(updateClock, 1000);
        return () => clearInterval(intervalId);
    }, []);

    return <span className="text-xs md:text-sm font-mono ml-2 md:ml-4">{time} (Hanoi)</span>;
};

const DailyQuote = () => {
    const [quote, setQuote] = useState("");
    useEffect(() => {
        setQuote(inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)]);
    }, []);
    return (
        <div className="my-4 p-3 bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-200 rounded-lg shadow text-center text-sm italic">
            <i className="fas fa-quote-left mr-2"></i>{quote}<i className="fas fa-quote-right ml-2"></i>
        </div>
    );
};


const Navbar = () => {
    const { user, loadingAuth, handleSignOut, handleGoogleSignIn } = useAuth();
    const { toggleDarkMode, settings } = useSettings();
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    return (
        <nav className="bg-indigo-600 dark:bg-indigo-800 text-white p-3 md:p-4 shadow-md sticky top-0 z-40">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-lg md:text-xl font-semibold">Thời Khóa Biểu Pro</h1>
                <HanoiClock />
                <div className="flex items-center space-x-2">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-md hover:bg-indigo-500 dark:hover:bg-indigo-700 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {settings.darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
                    </button>
                    <button
                        onClick={() => setShowSettingsModal(true)}
                        className="p-2 rounded-md hover:bg-indigo-500 dark:hover:bg-indigo-700 transition-colors"
                        aria-label="Mở cài đặt"
                    >
                        <i className="fas fa-cog"></i>
                    </button>
                    {loadingAuth ? (
                        <span className="text-sm"><i className="fas fa-spinner fa-spin mr-1"></i></span>
                    ) : user ? (
                        <>
                            <span className="text-xs md:text-sm hidden sm:block">
                                Chào, {user.isAnonymous ? "Khách" : (user.displayName?.split(' ')[0] || user.email?.split('@')[0] || user.uid.substring(0,6))}
                            </span>
                            <button 
                                onClick={handleSignOut}
                                className="bg-red-500 hover:bg-red-600 px-2 md:px-3 py-1 rounded-md text-xs md:text-sm"
                            >
                                Đăng xuất
                            </button>
                        </>
                    ) : (
                         <button 
                            onClick={handleGoogleSignIn}
                            className="bg-blue-500 hover:bg-blue-600 px-2 md:px-3 py-1 rounded-md text-xs md:text-sm inline-flex items-center"
                         >
                           <i className="fab fa-google mr-1 md:mr-2"></i> Đăng nhập
                         </button>
                    )}
                </div>
            </div>
            {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
        </nav>
    );
};

const PomodoroTimer = () => {
    const DFLT_WORK_MINUTES = 25;
    const DFLT_SHORT_BREAK_MINUTES = 5;
    const DFLT_LONG_BREAK_MINUTES = 15;
    const CYCLES_BEFORE_LONG_BREAK = 4;

    const [workDuration, setWorkDuration] = useState(DFLT_WORK_MINUTES);
    const [shortBreakDuration, setShortBreakDuration] = useState(DFLT_SHORT_BREAK_MINUTES);
    const [longBreakDuration, setLongBreakDuration] = useState(DFLT_LONG_BREAK_MINUTES);

    const [minutes, setMinutes] = useState(workDuration);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isWorkSession, setIsWorkSession] = useState(true);
    const [cycles, setCycles] = useState(0);
    const alarmSound = useRef(null);
    const [showSettings, setShowSettings] = useState(false);

    // States for custom input fields
    const [customWork, setCustomWork] = useState(DFLT_WORK_MINUTES.toString());
    const [customShort, setCustomShort] = useState(DFLT_SHORT_BREAK_MINUTES.toString());
    const [customLong, setCustomLong] = useState(DFLT_LONG_BREAK_MINUTES.toString());
    
    useEffect(() => { // Ensure timer display updates if workDuration changes and it's a work session
        if (isWorkSession && !isActive) {
            setMinutes(workDuration);
            setSeconds(0);
        }
    }, [workDuration, isWorkSession, isActive]);

    const playAlarm = useCallback(() => {
        console.log("PomodoroTimer: playAlarm called.");
        if (!window.Tone) {
            console.warn("PomodoroTimer: playAlarm - window.Tone is not available.");
            return;
        }
        if (!alarmSound.current) {
            console.log("PomodoroTimer: playAlarm - alarmSound.current is null, attempting to initialize Tone.Synth now.");
            try {
                alarmSound.current = new window.Tone.Synth().toDestination();
            } catch (e) {
                console.error("PomodoroTimer: playAlarm - Error initializing Tone.Synth:", e);
                return;
            }
        }
        if (!alarmSound.current) return;

        const playNotes = () => {
            try {
                alarmSound.current.triggerAttackRelease("C5", "8n", window.Tone.now());
                alarmSound.current.triggerAttackRelease("E5", "8n", window.Tone.now() + 0.2);
                alarmSound.current.triggerAttackRelease("G5", "8n", window.Tone.now() + 0.4);
            } catch (e) { console.error("PomodoroTimer: playAlarm - Error triggering notes:", e); }
        };

        if (window.Tone.context.state !== 'running') {
            window.Tone.start().then(playNotes).catch(e => console.error("PomodoroTimer: playAlarm - Error starting Tone.js AudioContext:", e));
        } else {
            playNotes();
        }
    }, []);

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                if (seconds === 0) {
                    if (minutes === 0) {
                        clearInterval(interval);
                        setIsActive(false);
                        playAlarm();
                        const newCycles = isWorkSession ? cycles + 1 : cycles;
                        if (isWorkSession) setCycles(newCycles);
                        
                        const nextIsWorkSession = !isWorkSession;
                        setIsWorkSession(nextIsWorkSession);

                        if (nextIsWorkSession) { 
                            setMinutes(workDuration);
                        } else { 
                            setMinutes(newCycles % CYCLES_BEFORE_LONG_BREAK === 0 ? longBreakDuration : shortBreakDuration);
                        }
                        setSeconds(0);
                    } else {
                        setMinutes(m => m - 1);
                        setSeconds(59);
                    }
                } else {
                    setSeconds(s => s - 1);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds, minutes, isWorkSession, cycles, playAlarm, workDuration, shortBreakDuration, longBreakDuration]);
    
    const handleSetDuration = (type, valueString) => {
        const value = parseInt(valueString, 10);
        if (isNaN(value) || value < 1) {
            // Optionally provide feedback to user about invalid input
            return;
        }

        if (type === 'work') {
            setWorkDuration(value);
            setCustomWork(valueString);
            if (isWorkSession && !isActive) {
                setMinutes(value);
                setSeconds(0);
            }
        } else if (type === 'short') {
            setShortBreakDuration(value);
            setCustomShort(valueString);
            if (!isWorkSession && !isActive && (cycles + 1) % CYCLES_BEFORE_LONG_BREAK !== 0) {
                setMinutes(value);
                setSeconds(0);
            }
        } else if (type === 'long') {
            setLongBreakDuration(value);
            setCustomLong(valueString);
            if (!isWorkSession && !isActive && (cycles + 1) % CYCLES_BEFORE_LONG_BREAK === 0) {
                setMinutes(value);
                setSeconds(0);
            }
        }
    };

    const toggleTimer = async () => {
        if (window.Tone && window.Tone.context.state !== 'running') {
            try {
                await window.Tone.start();
            } catch (e) { console.error("Error starting Tone.js context:", e); return; }
        }
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setIsWorkSession(true);
        setMinutes(workDuration); // Reset to current work duration
        setSeconds(0);
        setCycles(0);
    };

    const skipSession = () => {
        setIsActive(false);
        playAlarm();
        const newCycles = isWorkSession ? cycles + 1 : cycles;
        if (isWorkSession) setCycles(newCycles);

        const nextIsWorkSession = !isWorkSession;
        setIsWorkSession(nextIsWorkSession);
        if (nextIsWorkSession) {
            setMinutes(workDuration);
        } else {
            setMinutes(newCycles % CYCLES_BEFORE_LONG_BREAK === 0 ? longBreakDuration : shortBreakDuration);
        }
        setSeconds(0);
    };
    
    const presetDurations = {
        work: [20, 25, 30, 45, 50],
        shortBreak: [5, 10, 15],
        longBreak: [10, 15, 20, 30, 60]
    };

    return (
        <div className="my-6 p-4 md:p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md mx-auto text-center">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-semibold text-indigo-700 dark:text-indigo-300">
                    Đồng hồ Pomodoro ({isWorkSession ? "Làm việc" : "Nghỉ ngơi"})
                </h2>
                <button 
                    onClick={() => setShowSettings(!showSettings)} 
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    aria-label="Cài đặt Pomodoro"
                >
                    <i className={`fas ${showSettings ? 'fa-times' : 'fa-cog'}`}></i>
                </button>
            </div>

            {showSettings && (
                <div className="p-3 md:p-4 border border-gray-200 dark:border-gray-700 rounded-md mb-4 text-left space-y-3 bg-gray-50 dark:bg-slate-700 shadow">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tùy chỉnh thời gian (phút):</p>
                    {[
                        { label: 'Làm việc', type: 'work', value: customWork, setter: setCustomWork, presets: presetDurations.work },
                        { label: 'Nghỉ ngắn', type: 'short', value: customShort, setter: setCustomShort, presets: presetDurations.shortBreak },
                        { label: 'Nghỉ dài', type: 'long', value: customLong, setter: setCustomLong, presets: presetDurations.longBreak }
                    ].map(timerType => (
                        <div key={timerType.type} className="py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">{timerType.label}</label>
                            <div className="flex items-center space-x-2 mt-1">
                                <input 
                                    type="number" 
                                    min="1" 
                                    value={timerType.value} 
                                    onChange={(e) => timerType.setter(e.target.value)} 
                                    className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-500 rounded-md dark:bg-slate-600 dark:text-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <button 
                                    onClick={() => handleSetDuration(timerType.type, timerType.value)} 
                                    className="px-3 py-1 bg-indigo-500 text-white text-xs rounded-md hover:bg-indigo-600 transition-colors"
                                >
                                    Đặt
                                </button>
                            </div>
                            <div className="mt-1.5 space-x-1">
                                {timerType.presets.map(p => (
                                    <button 
                                        key={`${timerType.type}-${p}`} 
                                        onClick={() => { timerType.setter(p.toString()); handleSetDuration(timerType.type, p); }} 
                                        className="px-1.5 py-0.5 text-[10px] bg-gray-200 dark:bg-gray-500 rounded hover:bg-gray-300 dark:hover:bg-gray-400 transition-colors"
                                    >
                                        {p}p
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className={`text-5xl md:text-6xl font-bold mb-6 ${isWorkSession ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <button onClick={toggleTimer} className={`w-full sm:w-auto px-5 py-2 rounded-md font-medium text-white transition-colors ${isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                    {isActive ? <><i className="fas fa-pause mr-2"></i>Tạm dừng</> : <><i className="fas fa-play mr-2"></i>Bắt đầu</>}
                </button>
                <button onClick={resetTimer} className="w-full sm:w-auto px-5 py-2 rounded-md font-medium bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 transition-colors">
                    <i className="fas fa-redo mr-2"></i>Làm mới
                </button>
                 <button onClick={skipSession} className="w-full sm:w-auto px-5 py-2 rounded-md font-medium bg-teal-500 hover:bg-teal-600 text-white transition-colors" title="Bỏ qua phiên hiện tại">
                    <i className="fas fa-forward mr-2"></i>Bỏ qua
                </button>
            </div>
            <p className="text-xs md:text-sm mt-4 text-gray-600 dark:text-gray-400">Chu kỳ làm việc đã hoàn thành: {cycles}</p>
        </div>
    );
};

const ActivityCell = ({ activity, timeSlotIndex, activityIndex }) => {
    const { settings } = useSettings();
    const { updateActivity } = useSchedule();
    const [showEditModal, setShowEditModal] = useState(false);

    if (!activity) return <td className="border p-1 md:p-2 dark:border-gray-700 min-h-[70px] md:min-h-[80px]"></td>;

    const colorScheme = settings.subjectColors[activity.colorKey] || settings.subjectColors.default;
    
    const handleToggleComplete = (e) => {
        e.stopPropagation(); 
        updateActivity(timeSlotIndex, activityIndex, { isCompleted: !activity.isCompleted });
    };
    const handleEditClick = (e) => {
        e.stopPropagation();
        setShowEditModal(true);
    }

    return (
        <>
            <td 
                className={`activity-cell border p-1 md:p-2 min-h-[70px] md:min-h-[80px] relative group cursor-pointer ${colorScheme.bg} ${colorScheme.text} ${activity.isCompleted ? 'opacity-60' : ''}`}
                style={{ borderLeft: `4px solid ${settings.subjectColors[activity.colorKey]?.border || settings.subjectColors.default.border}` }}
                onClick={() => setShowEditModal(true)}
            >
                <div className="activity-content flex flex-col items-center justify-center text-center h-full">
                    {activity.icon && <i className={`${activity.icon} text-sm md:text-lg mb-1 ${colorScheme.text}`}></i>}
                    <span className={`font-medium text-xs md:text-sm ${activity.isCompleted ? 'line-through' : ''}`}>
                        {activity.activityName}
                    </span>
                    {activity.details && <div className="text-[10px] md:text-xs opacity-80 mt-0.5">{activity.details}</div>}
                    {activity.quickNote && 
                        <div className="text-[10px] md:text-xs italic mt-1 p-0.5 md:p-1 bg-black/10 dark:bg-white/10 rounded max-w-full overflow-hidden text-ellipsis whitespace-nowrap" title={activity.quickNote}>
                            <i className="fas fa-sticky-note mr-1"></i>{activity.quickNote}
                        </div>
                    }
                    <div className="absolute top-1 right-1 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                         <button 
                            onClick={handleToggleComplete}
                            className={`p-1 text-[10px] md:text-xs rounded ${activity.isCompleted ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : 'bg-green-400 hover:bg-green-500 text-white'}`}
                            title={activity.isCompleted ? "Đánh dấu chưa hoàn thành" : "Đánh dấu đã hoàn thành"}
                        >
                            <i className={`fas ${activity.isCompleted ? 'fa-times-circle' : 'fa-check-circle'}`}></i>
                        </button>
                        <button 
                            onClick={handleEditClick}
                            className="p-1 bg-blue-400 hover:bg-blue-500 text-white text-[10px] md:text-xs rounded"
                            title="Chỉnh sửa"
                        >
                            <i className="fas fa-pencil-alt"></i>
                        </button>
                    </div>
                </div>
            </td>
            {showEditModal && 
                <EditActivityModal 
                    activity={activity} 
                    timeSlotIndex={timeSlotIndex} 
                    activityIndex={activityIndex} 
                    onClose={() => setShowEditModal(false)} 
                />
            }
        </>
    );
};

const availableIcons = [
    { name: "Sách", value: "fas fa-book" },
    { name: "Sách (mở)", value: "fas fa-book-open" },
    { name: "Máy tính", value: "fas fa-laptop-code" },
    { name: "Bút", value: "fas fa-pencil-alt" },
    { name: "Giáo viên", value: "fas fa-chalkboard-teacher" },
    { name: "Học nhóm", value: "fas fa-users" },
    { name: "Nghỉ ngơi (Ghế)", value: "fas fa-couch" },
    { name: "Ăn uống", value: "fas fa-utensils" },
    { name: "Thể dục", value: "fas fa-dumbbell" },
    { name: "Đồng hồ", value: "fas fa-clock" },
    { name: "Lịch", value: "fas fa-calendar-alt" },
    { name: "Báo thức", value: "fas fa-bell" },
    { name: "Ngôn ngữ", value: "fas fa-language" },
    { name: "Toán (Máy tính)", value: "fas fa-calculator" },
    { name: "Địa danh (Hán ngữ)", value: "fas fa-landmark" },
    { name: "Cổng Torii (Nhật)", value: "fas fa-torii-gate" },
    { name: "Não (Gợi nhớ)", value: "fas fa-brain" },
    { name: "Đánh vần (Tiếng Anh)", value: "fas fa-spell-check" },
    { name: "Chip (CSD)", value: "fas fa-microchip" },
    { name: "Ghi chú", value: "fas fa-sticky-note" },
    { name: "Hoàn thành", value: "fas fa-check-circle" },
    { name: "Thông tin", value: "fas fa-info-circle" }
];

const EditActivityModal = ({ activity, timeSlotIndex, activityIndex, onClose }) => {
    const { updateActivity } = useSchedule();
    const { settings } = useSettings();

    const [currentActivityName, setCurrentActivityName] = useState(activity.activityName);
    const [currentDetails, setCurrentDetails] = useState(activity.details);
    const [currentQuickNote, setCurrentQuickNote] = useState(activity.quickNote || "");
    const [currentIcon, setCurrentIcon] = useState(activity.icon || "fas fa-book");
    const [currentColorKey, setCurrentColorKey] = useState(activity.colorKey || "default");

    const handleSubmit = (e) => {
        e.preventDefault();
        updateActivity(timeSlotIndex, activityIndex, {
            activityName: currentActivityName,
            details: currentDetails,
            quickNote: currentQuickNote,
            icon: currentIcon,
            colorKey: currentColorKey
        });
        onClose();
    };

    const colorOptions = Object.keys(settings.subjectColors)
        .map(key => ({
            value: key,
            label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        }));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Chỉnh sửa Hoạt động</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor={`activityName-${timeSlotIndex}-${activityIndex}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên hoạt động</label>
                        <input 
                            type="text" 
                            id={`activityName-${timeSlotIndex}-${activityIndex}`}
                            value={currentActivityName}
                            onChange={(e) => setCurrentActivityName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:text-gray-200"
                        />
                    </div>
                    <div>
                        <label htmlFor={`details-${timeSlotIndex}-${activityIndex}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chi tiết</label>
                        <input 
                            type="text" 
                            id={`details-${timeSlotIndex}-${activityIndex}`}
                            value={currentDetails}
                            onChange={(e) => setCurrentDetails(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:text-gray-200"
                        />
                    </div>
                     <div>
                        <label htmlFor={`icon-${timeSlotIndex}-${activityIndex}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Biểu tượng</label>
                        <select
                            id={`icon-${timeSlotIndex}-${activityIndex}`}
                            value={currentIcon}
                            onChange={(e) => setCurrentIcon(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:text-gray-200"
                        >
                            {availableIcons.map(iconOpt => (
                                <option key={iconOpt.value} value={iconOpt.value}>
                                    {iconOpt.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor={`colorKey-${timeSlotIndex}-${activityIndex}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Màu sắc</label>
                        <select
                            id={`colorKey-${timeSlotIndex}-${activityIndex}`}
                            value={currentColorKey}
                            onChange={(e) => setCurrentColorKey(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:text-gray-200"
                        >
                            {colorOptions.map(colorOpt => (
                                <option key={colorOpt.value} value={colorOpt.value}>
                                    {colorOpt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor={`quickNote-${timeSlotIndex}-${activityIndex}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ghi chú nhanh</label>
                        <textarea 
                            id={`quickNote-${timeSlotIndex}-${activityIndex}`}
                            value={currentQuickNote}
                            onChange={(e) => setCurrentQuickNote(e.target.value)}
                            rows="3"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:text-gray-200"
                        ></textarea>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md">Hủy</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">Lưu thay đổi</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TimetableGrid = () => {
    const { schedule, loadingSchedule, updateScheduleName } = useSchedule();
    const [editingName, setEditingName] = useState(false);
    const [currentScheduleName, setCurrentScheduleName] = useState(schedule.name);

    useEffect(() => {
        setCurrentScheduleName(schedule.name);
    }, [schedule.name]);

    const handleNameChange = (e) => {
        setCurrentScheduleName(e.target.value);
    };

    const handleNameSave = () => {
        if (currentScheduleName.trim() !== "") {
            updateScheduleName(currentScheduleName.trim());
        }
        setEditingName(false);
    };


    const days = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];

    if (loadingSchedule) return <div className="text-center p-10 dark:text-gray-300">Đang tải lịch trình... <i className="fas fa-spinner fa-spin"></i></div>;
    if (!schedule || !schedule.timeSlots) return <div className="text-center p-10 text-red-500 dark:text-red-400">Không tải được dữ liệu lịch trình.</div>;
    
    return (
        <>
            <div className="my-4 flex items-center justify-center">
                {editingName ? (
                    <div className="flex items-center space-x-2">
                        <input 
                            type="text"
                            value={currentScheduleName}
                            onChange={handleNameChange}
                            onBlur={handleNameSave} 
                            onKeyPress={(e) => { if (e.key === 'Enter') handleNameSave(); }}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg dark:bg-slate-700 dark:text-gray-200"
                            autoFocus
                        />
                        <button onClick={handleNameSave} className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600"><i className="fas fa-check"></i></button>
                    </div>
                ) : (
                    <h2 
                        className="text-2xl font-semibold text-center text-indigo-700 dark:text-indigo-300 hover:bg-gray-200 dark:hover:bg-slate-700 p-2 rounded cursor-pointer"
                        onClick={() => setEditingName(true)}
                        title="Nhấp để sửa tên lịch trình"
                    >
                        {schedule.name || "Lịch học của tôi"} <i className="fas fa-pencil-alt text-xs ml-2 opacity-50"></i>
                    </h2>
                )}
            </div>
            <div className="table-wrapper overflow-x-auto" id="tableWrapper">
                <div className="table-container bg-white dark:bg-slate-900" id="timetableContentForPdf">
                    <table className="min-w-[900px] w-full border-collapse" id="actualTableToCapture">
                        <thead>
                            <tr className="bg-indigo-600 dark:bg-indigo-800 text-white">
                                <th className="border p-1 md:p-2 dark:border-gray-700 w-[100px] md:w-1/12 text-xs md:text-sm">Thời gian</th>
                                {days.map(day => <th key={day} className="border p-1 md:p-2 dark:border-gray-700 w-auto text-xs md:text-sm">{day}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {schedule.timeSlots.map((slot, tsIdx) => (
                                <tr key={slot.time}>
                                    <td className="time-slot border p-1 md:p-2 dark:border-gray-700 text-xs md:text-sm align-middle">
                                        {slot.time}
                                    </td>
                                    {days.map((day) => { 
                                        const activity = slot.activities.find(act => act.day === day);
                                        const activityIndexInSlot = slot.activities.findIndex(a => a.day === day);
                                        return (
                                            <ActivityCell 
                                                key={`${slot.time}-${day}`}
                                                activity={activity} 
                                                timeSlotIndex={tsIdx}
                                                activityIndex={activityIndexInSlot}
                                            />
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

const SettingsModal = ({ onClose }) => {
    const { settings, updateSubjectColor, toggleDarkMode } = useSettings();
    const [tempColors, setTempColors] = useState(JSON.parse(JSON.stringify(settings.subjectColors)));

    const handleColorPropChange = (subjectKey, property, value) => {
        setTempColors(prev => ({
            ...prev,
            [subjectKey]: {
                ...prev[subjectKey],
                [property]: value
            }
        }));
    };
    
    const handleSaveColors = () => {
        Object.keys(tempColors).forEach(key => {
            if (JSON.stringify(tempColors[key]) !== JSON.stringify(settings.subjectColors[key])) {
                 updateSubjectColor(key, tempColors[key]);
            }
        });
        onClose();
    };
    
    const predefinedColorSets = [
        { name: 'Xanh lá', value: { bg: 'bg-green-100 dark:bg-green-700', text: 'text-green-800 dark:text-green-200', border: 'border-green-500' }},
        { name: 'Vàng', value: { bg: 'bg-yellow-100 dark:bg-yellow-700', text: 'text-yellow-800 dark:text-yellow-200', border: 'border-yellow-500' }},
        { name: 'Xanh trời', value: { bg: 'bg-sky-100 dark:bg-sky-700', text: 'text-sky-800 dark:text-sky-200', border: 'border-sky-500' }},
        { name: 'Hồng', value: { bg: 'bg-pink-100 dark:bg-pink-700', text: 'text-pink-800 dark:text-pink-200', border: 'border-pink-500' }},
        { name: 'Tím Violet', value: { bg: 'bg-violet-100 dark:bg-violet-700', text: 'text-violet-800 dark:text-violet-200', border: 'border-violet-500' }},
        { name: 'Hồng Rose', value: { bg: 'bg-rose-200 dark:bg-rose-600', text: 'text-rose-800 dark:text-rose-100', border: 'border-rose-500' }},
        { name: 'Xám', value: { bg: 'bg-gray-200 dark:bg-gray-600', text: 'text-gray-800 dark:text-gray-100', border: 'border-gray-500' }},
        { name: 'Cam', value: { bg: 'bg-orange-200 dark:bg-orange-600', text: 'text-orange-800 dark:text-orange-100', border: 'border-orange-500' }},
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Cài đặt</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Chế độ hiển thị</h4>
                    <button 
                        onClick={toggleDarkMode} 
                        className="w-full px-4 py-2 rounded-md font-medium text-white bg-slate-500 hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                    >
                        {settings.darkMode ? <><i className="fas fa-sun mr-2"></i>Chuyển sang chế độ Sáng</> : <><i className="fas fa-moon mr-2"></i>Chuyển sang chế độ Tối</>}
                    </button>
                </div>

                <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Màu sắc Môn học/Hoạt động</h4>
                <div className="space-y-4">
                    {Object.entries(tempColors).filter(([key]) => key !== 'default').map(([subjectKey, colorValue]) => (
                        <div key={subjectKey} className="p-3 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-slate-700">
                            <p className="font-medium capitalize text-gray-700 dark:text-gray-300 mb-2">{subjectKey.replace(/_/g, ' ')}</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-2">
                                {predefinedColorSets.map(opt => (
                                    <button 
                                        key={opt.name}
                                        onClick={() => {
                                            handleColorPropChange(subjectKey, 'bg', opt.value.bg);
                                            handleColorPropChange(subjectKey, 'text', opt.value.text);
                                            handleColorPropChange(subjectKey, 'border', opt.value.border);
                                        }}
                                        className={`p-2 rounded text-xs h-10 ${opt.value.bg} ${opt.value.text} border-2 ${colorValue.bg === opt.value.bg ? opt.value.border : 'border-transparent'}`}
                                        title={`Áp dụng màu ${opt.name}`}
                                    >
                                        {opt.name}
                                    </button>
                                ))}
                            </div>
                             <div className="text-xs space-y-1">
                                <label className="block text-gray-600 dark:text-gray-400">Lớp CSS nền (bg):</label>
                                <input type="text" value={colorValue.bg} onChange={(e) => handleColorPropChange(subjectKey, 'bg', e.target.value)} className="w-full p-1 border dark:border-gray-500 rounded-sm text-xs dark:bg-slate-600 dark:text-gray-200"/>
                                <label className="block text-gray-600 dark:text-gray-400">Lớp CSS chữ (text):</label>
                                <input type="text" value={colorValue.text} onChange={(e) => handleColorPropChange(subjectKey, 'text', e.target.value)} className="w-full p-1 border dark:border-gray-500 rounded-sm text-xs dark:bg-slate-600 dark:text-gray-200"/>
                                <label className="block text-gray-600 dark:text-gray-400">Lớp CSS viền (border):</label>
                                <input type="text" value={colorValue.border} onChange={(e) => handleColorPropChange(subjectKey, 'border', e.target.value)} className="w-full p-1 border dark:border-gray-500 rounded-sm text-xs dark:bg-slate-600 dark:text-gray-200"/>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 flex justify-end">
                    <button onClick={handleSaveColors} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md text-sm">Lưu Thay Đổi Màu Sắc</button>
                </div>
            </div>
        </div>
    );
};

const ToolsSection = () => {
    const { schedule } = useSchedule();
    const { settings } = useSettings();
    const [notificationMessage, setNotificationMessage] = useState("");
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const handleDownloadPdf = async () => {
        if (typeof window.html2pdf === 'undefined') {
            console.error("html2pdf.js is not loaded.");
            setNotificationMessage("Lỗi: Thư viện tạo PDF chưa tải xong. Vui lòng thử lại sau giây lát.");
            return;
        }

        const tableElement = document.getElementById('actualTableToCapture');
        if (!tableElement) {
            console.error("Element with ID 'actualTableToCapture' not found.");
            setNotificationMessage("Lỗi: Không tìm thấy bảng lịch để xuất PDF.");
            return;
        }
        
        setIsGeneratingPdf(true);
        setNotificationMessage("Đang tạo PDF, vui lòng đợi...");

        try {
            // Tạo container tạm thời để render PDF
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '-9999px';
            document.body.appendChild(tempContainer);
            
            // Clone table để sửa các thuộc tính
            const clonedTable = tableElement.cloneNode(true);
            
            // Tạo tiêu đề cho PDF
            const headerDiv = document.createElement('div');
            headerDiv.style.textAlign = 'center';
            headerDiv.style.margin = '10px 0 20px 0';
            headerDiv.style.fontFamily = 'Arial, sans-serif';
            
            const titleElement = document.createElement('h2');
            titleElement.textContent = schedule.name || "Lịch học của tôi";
            titleElement.style.fontSize = '24px';
            titleElement.style.fontWeight = 'bold';
            titleElement.style.marginBottom = '5px';
            titleElement.style.color = settings.darkMode ? '#e2e8f0' : '#1e293b';
            
            headerDiv.appendChild(titleElement);
            
            // Tạo container chứa nội dung PDF
            const pdfContainer = document.createElement('div');
            pdfContainer.style.padding = '0';
            pdfContainer.style.background = settings.darkMode ? '#1e293b' : '#ffffff';
            pdfContainer.style.color = settings.darkMode ? '#e2e8f0' : '#1e293b';
            
            // Đảm bảo Font Awesome được nhúng vào PDF
            const faStyle = document.createElement('style');
            faStyle.textContent = `
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
                
                table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 0;
                }
                
                th {
                    background-color: ${settings.darkMode ? '#334155' : '#4f46e5'};
                    color: white;
                    padding: 8px;
                    text-align: center;
                    border: 1px solid ${settings.darkMode ? '#475569' : '#4338ca'};
                }
                
                td {
                    padding: 8px;
                    text-align: center;
                    border: 1px solid ${settings.darkMode ? '#475569' : '#e2e8f0'};
                }
                
                .time-slot {
                    font-weight: bold;
                }
                
                i.fas, i.fa, i.fab {
                    display: inline-block;
                    font-style: normal;
                    font-variant: normal;
                    text-rendering: auto;
                    line-height: 1;
                }
            `;
            
            pdfContainer.appendChild(faStyle);
            pdfContainer.appendChild(headerDiv);
            pdfContainer.appendChild(clonedTable);
            tempContainer.appendChild(pdfContainer);
            
            // Xử lý màu nền và các thuộc tính hiển thị của các ô
            const cells = clonedTable.querySelectorAll('.activity-cell');
            cells.forEach(cell => {
                // Giữ nguyên classes liên quan đến màu sắc
                const classesToKeep = Array.from(cell.classList).filter(cls => 
                    cls.startsWith('bg-') || 
                    cls.startsWith('text-') || 
                    cls.startsWith('border-')
                );
                
                // Thêm style trực tiếp để đảm bảo hiển thị đúng trong PDF
                if (cell.querySelector('.activity-content')) {
                    const content = cell.querySelector('.activity-content');
                    content.style.display = 'flex';
                    content.style.flexDirection = 'column';
                    content.style.alignItems = 'center';
                    content.style.justifyContent = 'center';
                    content.style.height = '100%';
                    content.style.padding = '8px';
                }
                
                // Ẩn các nút action (hoàn thành, chỉnh sửa) trong PDF
                const actionButtons = cell.querySelectorAll('button');
                actionButtons.forEach(btn => btn.style.display = 'none');
            });
            
            // Cấu hình PDF
            const scheduleName = schedule.name || "ThoiKhoaBieu";
            const filename = `${scheduleName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
            
            const opt = {
                margin: [10, 10, 10, 10], // top, left, bottom, right
                filename: filename,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    allowTaint: true,
                    backgroundColor: settings.darkMode ? '#1e293b' : '#ffffff',
                    windowWidth: pdfContainer.scrollWidth,
                    width: pdfContainer.scrollWidth,
                    height: pdfContainer.scrollHeight,
                    removeContainer: true
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'landscape',
                    compress: true
                },
                fontFaces: [
                    {
                        family: 'FontAwesome',
                        style: 'normal',
                        weight: 'normal',
                        src: [{ url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-solid-900.woff2', format: 'woff2' }]
                    }
                ]
            };

            await window.html2pdf().from(pdfContainer).set(opt).save();
            setNotificationMessage(`Đã tải xuống ${filename} thành công!`);
            
            // Dọn dẹp sau khi tạo PDF
            document.body.removeChild(tempContainer);
            
        } catch (error) {
            console.error("Error generating PDF:", error);
            setNotificationMessage("Lỗi khi tạo PDF: " + error.message);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const requestNotificationPermission = async () => {
        setNotificationMessage(""); 
        console.log("Notification permission current state:", Notification.permission);
        if (!("Notification" in window)) {
            setNotificationMessage("Trình duyệt này không hỗ trợ thông báo trên màn hình.");
            return;
        }
        if (Notification.permission === "granted") {
            try {
                new Notification("Thời Khóa Biểu Pro", { body: "Bạn đã bật thông báo!", icon: "https://img.icons8.com/fluency/48/alarm-clock.png" });
                setNotificationMessage("Đã gửi thông báo thử nghiệm (quyền đã được cấp).");
            } catch(e) {
                 setNotificationMessage("Lỗi khi gửi thông báo (đã cấp quyền): " + e.message);
                 console.error("Error sending granted notification:", e);
            }
        } else if (Notification.permission !== "denied") {
            try {
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    new Notification("Thời Khóa Biểu Pro", { body: "Cảm ơn! Thông báo đã được bật.", icon: "https://img.icons8.com/fluency/48/alarm-clock.png" });
                    setNotificationMessage("Thông báo đã được bật và gửi thử nghiệm.");
                } else {
                    setNotificationMessage("Bạn đã không cấp quyền cho thông báo.");
                }
            } catch(e) {
                 setNotificationMessage("Lỗi khi yêu cầu quyền thông báo: " + e.message);
                 console.error("Error requesting notification permission:", e);
            }
        } else {
            setNotificationMessage("Bạn đã từ chối quyền thông báo. Vui lòng thay đổi trong cài đặt trình duyệt.");
        }
    };

    return (
        <div className="my-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3 text-indigo-700 dark:text-indigo-300">Công cụ & Tiện ích</h3>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button 
                    onClick={requestNotificationPermission}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                    <i className="fas fa-bell mr-2"></i>Bật Thông Báo
                </button>
                <button
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                >
                    {isGeneratingPdf ? <><i className="fas fa-spinner fa-spin mr-2"></i>Đang tạo...</> : <><i className="fas fa-file-pdf mr-2"></i>Tải xuống PDF</>}
                </button>
            </div>
            {notificationMessage && <p className="text-sm mt-3 text-center text-gray-600 dark:text-gray-400">{notificationMessage}</p>}
        </div>
    );
};


// --- Activity Notifier Component ---
const ActivityNotifier = () => {
    const { schedule } = useSchedule(); 
    const notifiedTodayRef = useRef(new Set()); 
    const lastNotificationCheckDayRef = useRef(null); 

    useEffect(() => {
        const checkScheduleAndNotify = () => {
            if (Notification.permission !== 'granted' || !schedule || !schedule.timeSlots) {
                return;
            }

            const nowHanoi = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
            const currentDayHanoi = nowHanoi.toLocaleDateString('vi-VN', { weekday: 'long' }); 
            const currentHourHanoi = nowHanoi.getHours();
            const currentMinuteHanoi = nowHanoi.getMinutes();
            const currentDateHanoiStr = nowHanoi.toDateString(); 

            if (lastNotificationCheckDayRef.current !== currentDateHanoiStr) {
                console.log("ActivityNotifier: New day, resetting notifiedToday set."); 
                notifiedTodayRef.current.clear();
                lastNotificationCheckDayRef.current = currentDateHanoiStr;
            }
            
            schedule.timeSlots.forEach(slot => {
                const slotTimeParts = slot.time.split(' - ')[0].split(':'); 
                const slotHour = parseInt(slotTimeParts[0], 10);
                const slotMinute = parseInt(slotTimeParts[1], 10);

                if (slotHour === currentHourHanoi && slotMinute === currentMinuteHanoi) {
                    const activityForToday = slot.activities.find(act => act.day === currentDayHanoi);
                    if (activityForToday) {
                        const notificationId = `${currentDateHanoiStr}-${slot.time}-${activityForToday.activityName}`;
                        if (!notifiedTodayRef.current.has(notificationId)) {
                            console.log(`ActivityNotifier: Sending notification for ${activityForToday.activityName} at ${slot.time}`); 
                            new Notification(`Đến giờ ${activityForToday.activityName}!`, {
                                body: `(${slot.time})`,
                                icon: '/logo192.png' 
                            });
                            notifiedTodayRef.current.add(notificationId);
                        }
                    }
                }
            });
        };

        const intervalId = setInterval(checkScheduleAndNotify, 30000); 
        checkScheduleAndNotify();
        return () => clearInterval(intervalId);
    }, [schedule]); 

    return null; 
};

// --- Main App Component ---
// Trivial change to re-trigger deployment
function App() {
    useEffect(() => {
        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.rel = 'stylesheet';
        fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
        document.head.appendChild(fontAwesomeLink);

        const libraries = [
            { id: 'domtoimage-lib', src: 'https://cdnjs.cloudflare.com/ajax/libs/dom-to-image-more/2.9.5/dom-to-image-more.min.js' },
            { id: 'jspdf-lib', src: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js' },
            { id: 'html2pdf-lib', src: 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js' },
            { id: 'tonejs-lib', src: 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js' }
        ];

        libraries.forEach(lib => {
            if (!document.getElementById(lib.id)) {
                const script = document.createElement('script');
                script.id = lib.id;
                script.src = lib.src;
                script.async = true; 
                script.onload = () => console.log(`${lib.id} loaded.`);
                script.onerror = () => console.error(`Error loading ${lib.id}.`);
                document.head.appendChild(script);
            }
        });
        
        return () => {
            document.head.removeChild(fontAwesomeLink);
            // Optionally remove dynamically added library scripts if needed, though usually not necessary
        };
    }, []);

    return (
        <AuthProvider>
            <SettingsProvider>
                <ScheduleProvider>
                    <ActivityNotifier /> 
                    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                        <Navbar />
                        <main className="container mx-auto px-2 py-4 md:px-4 md:py-8">
                            <DailyQuote />
                            <PomodoroTimer />
                            <TimetableGrid />
                            <ToolsSection />
                        </main>
                        <footer className="text-center py-4 text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-700">
                            Thời Khóa Biểu Pro - Được tạo bởi AI. App ID: {appId}
                        </footer>
                    </div>
                </ScheduleProvider>
            </SettingsProvider>
        </AuthProvider>
    );
}

export default App;// TEST CHANGE
