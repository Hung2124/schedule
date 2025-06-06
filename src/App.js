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
import html2canvas from 'html2canvas';

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
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    // Khai báo hàm toggleDarkMode với useCallback để tránh tạo hàm mới mỗi khi render 
    const toggleDarkMode = useCallback((forceDark) => {
        if (!settings) return; // Tránh lỗi nếu settings chưa được khởi tạo
        
        const newDarkMode = forceDark !== undefined ? forceDark : !settings.darkMode;
        
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        // Cập nhật settings với logic ở bên trong hàm này
        const updatedSettings = {
            ...settings,
            darkMode: newDarkMode
        };
        
        setSettings(updatedSettings);
        
        // Lưu vào localStorage trong mọi trường hợp để phục vụ non-auth users
        localStorage.setItem('scheduleAppSettings', JSON.stringify(updatedSettings));
        
        if (auth.currentUser) {
            const settingsRef = doc(db, `users/${auth.currentUser.uid}/settings/main`);
            setDoc(settingsRef, updatedSettings, { merge: true })
                .catch(error => console.error("Error updating darkMode in Firestore:", error));
        }
    }, [settings]); // Chỉ phụ thuộc vào settings

    // Cập nhật settings chung - tách riêng với toggleDarkMode
    const updateSettings = useCallback(async (newSettingsPartial) => {
        try {
            if (!settings) return false;
            
            const updatedSettings = {
                ...settings,
                ...newSettingsPartial
            };
            
            setSettings(updatedSettings);
            
            // Lưu vào localStorage trong mọi trường hợp để phục vụ non-auth users
            localStorage.setItem('scheduleAppSettings', JSON.stringify(updatedSettings));
            
            if (auth.currentUser) {
                const settingsRef = doc(db, `users/${auth.currentUser.uid}/settings/main`);
                await setDoc(settingsRef, updatedSettings, { merge: true });
            }
            
            return true;
        } catch (error) {
            console.error("Error updating settings:", error);
            return false;
        }
    }, [settings]);

    // Các hàm con khác
    const updateSubjectColor = useCallback((subjectKey, colorProperties) => {
        if (!settings) return;
        const updatedColors = { ...settings.subjectColors, [subjectKey]: colorProperties };
        updateSettings({ subjectColors: updatedColors });
    }, [settings, updateSettings]);
    
    const updateScheduleNameInSettings = useCallback((newName) => {
        if (!settings) return;
        updateSettings({ scheduleName: newName });
    }, [settings, updateSettings]);
    
    // Load settings khi component khởi tạo
    useEffect(() => {
        const loadSettings = async () => {
            setLoading(true);
            try {
                let userSettings = null;
                
                if (!auth.currentUser) {
                    // Kiểm tra localStorage nếu chưa đăng nhập
                    const localSettings = localStorage.getItem('scheduleAppSettings');
                    if (localSettings) {
                        userSettings = JSON.parse(localSettings);
                    }
                } else {
                    // Nếu đã đăng nhập, lấy từ Firestore
                    const settingsRef = doc(db, `users/${auth.currentUser.uid}/settings/main`);
                    const settingsSnap = await getDoc(settingsRef);
                    
                    if (settingsSnap.exists()) {
                        userSettings = settingsSnap.data();
                    }
                }
                
                // Nếu không có settings từ trước, khởi tạo với cài đặt mặc định và tự động nhận diện dark mode
                if (!userSettings) {
                    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    userSettings = {
                        ...defaultSettings,
                        darkMode: prefersDarkMode
                    };
                }
                
                // Áp dụng dark mode ngay lập tức
                if (userSettings.darkMode) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                
                setSettings(userSettings);
                
                // Lưu vào localStorage đồng bộ để tránh flash
                localStorage.setItem('scheduleAppSettings', JSON.stringify(userSettings));
            } catch (error) {
                console.error("Error loading settings:", error);
                // Nếu có lỗi, dùng cài đặt mặc định
                setSettings(defaultSettings);
            } finally {
                setLoading(false);
            }
        };
        
        loadSettings();
    }, []);

    // Thêm listener cho dark mode OS để tự động cập nhật nếu có thay đổi
    useEffect(() => {
        if (!settings) return;

        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleColorSchemeChange = (e) => {
            if (!auth.currentUser) {
                // Chỉ tự động cập nhật nếu người dùng chưa đặt tùy chỉnh riêng (chưa đăng nhập)
                toggleDarkMode(e.matches);
            }
        };
        
        darkModeMediaQuery.addEventListener('change', handleColorSchemeChange);
        return () => darkModeMediaQuery.removeEventListener('change', handleColorSchemeChange);
    }, [settings, toggleDarkMode]);
    
    return (
        <SettingsContext.Provider 
            value={{ 
                settings, 
                loading, 
                updateSettings, 
                toggleDarkMode, 
                updateSubjectColor,
                updateScheduleNameInSettings
            }}
        >
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
        // Cập nhật cả trong schedule và settings để đồng bộ
        const updatedSchedule = { ...schedule, name: newName };
        setSchedule(updatedSchedule);
        
        // Cập nhật vào localStorage để đảm bảo dữ liệu không bị mất
        try {
            const localData = localStorage.getItem('scheduleData');
            if (localData) {
                const parsedData = JSON.parse(localData);
                localStorage.setItem('scheduleData', JSON.stringify({
                    ...parsedData,
                    name: newName
                }));
            } else {
                localStorage.setItem('scheduleData', JSON.stringify({ 
                    name: newName,
                    timeSlots: schedule.timeSlots
                }));
            }
        } catch (err) {
            console.error('Error saving schedule name to localStorage', err);
        }
        
        // Cập nhật lên Firestore
        if (user && db) {
            const scheduleRef = doc(db, `users/${user.uid}/schedules`, scheduleId);
            try {
                await updateDoc(scheduleRef, { name: newName });
                console.log("Schedule name updated in Firestore");
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
    const [date, setDate] = useState("");
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const updateClock = () => {
            try {
                // Create date object for Vietnam timezone (+7)
                const now = new Date();
                
                // Format time manually to ensure accuracy
                const formatter = new Intl.DateTimeFormat('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZone: 'Asia/Ho_Chi_Minh',
                    hour12: false
                });
                const hanoiTime = formatter.format(now);
                
                // Format date with correct locale settings
                const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                    timeZone: 'Asia/Ho_Chi_Minh',
                });
                const hanoiDate = dateFormatter.format(now);
                
                setTime(hanoiTime);
                setDate(hanoiDate);
                
                // Add a little animation on second change
                setAnimate(true);
                setTimeout(() => setAnimate(false), 500);
            } catch (error) {
                console.error("Error updating clock:", error);
            }
        };
        
        updateClock();
        const intervalId = setInterval(updateClock, 1000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center">
            <span className={`text-xs md:text-sm font-mono text-blue-100 font-medium transition-transform ${animate ? 'scale-105' : 'scale-100'}`}>
                {time || "--:--:--"}
            </span>
            <span className="text-[10px] text-blue-200/80">{date || "-- --/--"}</span>
        </div>
    );
};

const DailyQuote = () => {
    const [quote, setQuote] = useState("");
    useEffect(() => {
        setQuote(inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)]);
    }, []);
    return (
        <div className="my-6 p-4 bg-gradient-to-br from-amber-100/90 to-amber-50/80 dark:from-amber-800/30 dark:to-amber-900/20 backdrop-blur-sm text-amber-800 dark:text-amber-200 rounded-xl shadow-lg text-center text-sm italic border border-amber-200/30 dark:border-amber-700/30">
            <div className="flex items-center justify-center">
                <i className="fas fa-quote-left mr-3 text-amber-500/70 dark:text-amber-400/70 text-xl"></i>
                <p className="leading-relaxed">{quote}</p>
                <i className="fas fa-quote-right ml-3 text-amber-500/70 dark:text-amber-400/70 text-xl"></i>
            </div>
        </div>
    );
};


const Navbar = () => {
    const { user, loadingAuth, handleSignOut, handleGoogleSignIn } = useAuth();
    const { toggleDarkMode, settings } = useSettings();
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");
    const dynamicIslandRef = useRef(null); // Tham chiếu đến Dynamic Island

    // Animation utility function
    const showBriefNotification = (message) => {
        setNotificationMessage(message);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
    };

    // Toggle expand/collapse for Dynamic Island effect
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    // Close Dynamic Island - với kiểm tra click có nằm trong Dynamic Island không
    const handleOutsideClick = (e) => {
        if (dynamicIslandRef.current && !dynamicIslandRef.current.contains(e.target)) {
            setIsExpanded(false);
        }
    };

    // Đăng ký sự kiện click toàn cục khi Dynamic Island mở
    useEffect(() => {
        if (isExpanded) {
            document.addEventListener('mousedown', handleOutsideClick);
        } else {
            document.removeEventListener('mousedown', handleOutsideClick);
        }
        
        // Dọn dẹp khi component unmount
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isExpanded]);

    return (
        <nav className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-700 dark:from-indigo-900 dark:via-indigo-800 dark:to-indigo-900 text-white p-3 md:p-4 shadow-lg sticky top-0 z-40 relative">
            {/* Notification popup - very simple design */}
            {showNotification && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2 rounded-full text-white text-sm shadow-lg z-50 pointer-events-none">
                    {notificationMessage}
                </div>
            )}
            
            <div className="container mx-auto">
                {/* Dynamic Island inspired container */}
                <div 
                    ref={dynamicIslandRef}
                    className={`mx-auto max-w-4xl transition-all duration-300 ease-in-out dynamic-island-component z-40 relative
                    ${isExpanded ? 'backdrop-blur-md bg-white/10 rounded-2xl p-4 shadow-lg' : 'bg-transparent'}`}
                >
                    
                    {/* Main bar with pill shape when collapsed */}
                    <div className={`grid grid-cols-3 items-center dynamic-island-component
                        ${!isExpanded && 'backdrop-blur-md bg-white/10 rounded-full px-4 py-2 shadow-md transition-all duration-300'}`}
                        onClick={!isExpanded ? toggleExpand : undefined}
                    >
                        
                        {/* App title with animation */}
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full bg-emerald-400 animate-pulse ${isExpanded ? 'mr-2' : ''}`}></div>
                            <h1 className="text-lg md:text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                                Thời Khóa Biểu Pro
                            </h1>
                        </div>

                        {/* Clock with enhanced styling - now in center column */}
                        <div className="flex justify-center">
                            <div className={`clock-widget backdrop-blur-md bg-white/10 rounded-full px-4 py-1.5 
                                flex items-center justify-center transition-all duration-300
                                ${isExpanded ? 'scale-110 shadow-lg' : 'scale-100'}`}>
                                <i className="fas fa-clock mr-2.5 text-blue-200"></i>
                                <HanoiClock />
                            </div>
                        </div>

                        {/* Buttons area - only show icon when collapsed - now right-aligned */}
                        <div className="flex items-center justify-end space-x-2 dynamic-island-component">
                            {!isExpanded && (
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleExpand();
                                    }}>
                                    <i className="fas fa-ellipsis-h text-xs"></i>
                                </div>
                            )}
                            
                            {isExpanded && (
                                <>
                                    <button
                                        onClick={() => toggleDarkMode()}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full aspect-square flex items-center justify-center transition-colors"
                                        aria-label="Toggle dark mode"
                                        title={settings.darkMode ? "Chuyển sáng" : "Chuyển tối"}
                                    >
                                        {settings.darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowSettingsModal(true);
                                            showBriefNotification("Đang mở cài đặt...");
                                        }}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full aspect-square flex items-center justify-center transition-colors"
                                        aria-label="Mở cài đặt"
                                        title="Cài đặt"
                                    >
                                        <i className="fas fa-cog"></i>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {/* Expanded content - user info and controls */}
                    {isExpanded && (
                        <div className="mt-4 animate-fadeIn">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-lg font-bold shadow-md">
                                        {user && (user.displayName?.charAt(0) || user.email?.charAt(0) || "U")}
                                    </div>
                                    <div>
                                        {loadingAuth ? (
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                <span className="text-sm">Đang tải...</span>
                                            </div>
                                        ) : user ? (
                                            <div>
                                                <p className="font-medium">
                                                    Chào, {user.isAnonymous ? "Khách" : (user.displayName?.split(' ')[0] || user.email?.split('@')[0] || user.uid.substring(0,6))}
                                                </p>
                                                <p className="text-xs text-blue-200 opacity-80">{user.email || "Người dùng khách"}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm font-medium">Chưa đăng nhập</p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    {user ? (
                                        <button 
                                            onClick={() => {
                                                handleSignOut();
                                                setIsExpanded(false);
                                                showBriefNotification("Đang đăng xuất...");
                                            }}
                                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center shadow-lg transition-all duration-200"
                                        >
                                            <i className="fas fa-sign-out-alt mr-1.5"></i> Đăng xuất
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => {
                                                handleGoogleSignIn();
                                            }}
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center shadow-lg transition-all duration-200"
                                        >
                                            <i className="fab fa-google mr-1.5"></i> Đăng nhập
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setIsExpanded(false)}
                                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                                        title="Đóng"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
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
        // Sử dụng global function từ notification.js
        if (window.playNotificationSound) {
            window.playNotificationSound();
        } else {
            console.warn("PomodoroTimer: playNotificationSound function is not available.");
            // Fallback nếu function không tồn tại
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return;
                
                const audioCtx = new AudioContext();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                oscillator.type = 'sine';
                oscillator.frequency.value = 800;
                gainNode.gain.value = 0.5;
                
                oscillator.start();
                setTimeout(() => oscillator.stop(), 500);
            } catch (e) {
                console.error("PomodoroTimer: Fallback sound failed:", e);
            }
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
        <div className="my-8 bg-gradient-to-br from-white/90 to-white/70 dark:from-slate-800/90 dark:to-slate-800/70 backdrop-blur-sm rounded-2xl shadow-xl max-w-md mx-auto overflow-hidden border border-white/20 dark:border-slate-700/50">
            <div className="bg-gradient-to-r from-indigo-600/90 to-purple-600/90 p-4 text-white">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl md:text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                        Đồng hồ Pomodoro
                    </h2>
                    <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'} mr-2`}></div>
                        <span className="text-xs uppercase tracking-wider font-medium">
                            {isActive ? 'Đang chạy' : 'Tạm dừng'}
                        </span>
                    </div>
                    <button 
                        onClick={() => setShowSettings(!showSettings)} 
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center justify-center"
                        aria-label="Cài đặt Pomodoro"
                    >
                        <i className={`fas ${showSettings ? 'fa-times' : 'fa-cog'}`}></i>
                    </button>
                </div>

                <div className="flex items-center justify-center">
                    <div className={`text-5xl md:text-6xl font-bold mb-1 transition-all duration-300 ${isWorkSession ? 'text-red-300' : 'text-green-300'}`}>
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>
                </div>
                <div className="text-center mb-2 py-1 px-3 bg-white/10 backdrop-blur-sm rounded-full text-xs inline-block mx-auto">
                    {isWorkSession ? "Làm việc" : "Nghỉ ngơi"}
                </div>
            </div>

            {showSettings && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3 bg-white/50 dark:bg-slate-800/50">
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

            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
                    <button onClick={toggleTimer} className={`w-full sm:w-auto px-5 py-2.5 rounded-full font-medium text-white shadow-lg transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'}`}>
                        {isActive ? <><i className="fas fa-pause mr-2"></i>Tạm dừng</> : <><i className="fas fa-play mr-2"></i>Bắt đầu</>}
                    </button>
                    <button onClick={resetTimer} className="w-full sm:w-auto px-5 py-2.5 rounded-full font-medium bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 shadow-lg transition-colors">
                        <i className="fas fa-redo mr-2"></i>Làm mới
                    </button>
                     <button onClick={skipSession} className="w-full sm:w-auto px-5 py-2.5 rounded-full font-medium bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg transition-colors">
                        <i className="fas fa-forward mr-2"></i>Bỏ qua
                    </button>
                </div>
                <div className="flex justify-center">
                    <div className="bg-gray-100 dark:bg-slate-700 rounded-full py-1 px-4 inline-flex items-center">
                        <i className="fas fa-history mr-2 text-gray-500 dark:text-gray-400"></i>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Chu kỳ hoàn thành: <span className="font-medium">{cycles}</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActivityCell = ({ activity, timeSlotIndex, activityIndex }) => {
    const { settings } = useSettings();
    const { updateActivity } = useSchedule();
    const [showEditModal, setShowEditModal] = useState(false);

    if (!activity) return <td className="border p-2 md:p-3 dark:border-gray-700 min-h-[70px] md:min-h-[80px]"></td>;

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
                className={`activity-cell border dark:border-gray-700 p-2 md:p-3 min-h-[70px] md:min-h-[80px] relative group cursor-pointer ${colorScheme.bg} ${colorScheme.text} ${activity.isCompleted ? 'opacity-60' : ''} transition-all duration-200 hover:shadow-md`}
                style={{ borderLeft: `4px solid ${settings.subjectColors[activity.colorKey]?.border || settings.subjectColors.default.border}` }}
                onClick={() => setShowEditModal(true)}
            >
                <div className="activity-content flex flex-col items-center justify-center text-center h-full">
                    {activity.icon && <i className={`${activity.icon} text-sm md:text-lg mb-1.5 ${colorScheme.text}`}></i>}
                    <span className={`font-medium text-xs md:text-sm ${activity.isCompleted ? 'line-through' : ''}`}>
                        {activity.activityName}
                    </span>
                    {activity.details && <div className="text-[10px] md:text-xs opacity-80 mt-1">{activity.details}</div>}
                    {activity.quickNote && 
                        <div className="text-[10px] md:text-xs italic mt-1.5 p-1 md:p-1.5 bg-gray-100/30 dark:bg-white/10 rounded-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap" title={activity.quickNote}>
                            <i className="fas fa-sticky-note mr-1"></i>{activity.quickNote}
                        </div>
                    }
                    <div className="absolute top-1 right-1 flex flex-col space-y-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                         <button 
                            onClick={handleToggleComplete}
                            className={`p-1.5 text-[10px] md:text-xs rounded-full ${activity.isCompleted ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : 'bg-green-400 hover:bg-green-500 text-white'} shadow-sm hover:shadow transition-all`}
                            title={activity.isCompleted ? "Đánh dấu chưa hoàn thành" : "Đánh dấu đã hoàn thành"}
                        >
                            <i className={`fas ${activity.isCompleted ? 'fa-times-circle' : 'fa-check-circle'}`}></i>
                        </button>
                        <button 
                            onClick={handleEditClick}
                            className="p-1.5 bg-blue-400 hover:bg-blue-500 text-white text-[10px] md:text-xs rounded-full shadow-sm hover:shadow transition-all"
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
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-[100] p-4 modal-component">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/20 dark:border-slate-700/50 modal-component">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-white">Chỉnh sửa Hoạt động</h3>
                        <button 
                            onClick={onClose} 
                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
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
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full">Hủy</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-full shadow-md">Lưu thay đổi</button>
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

    if (loadingSchedule) return (
        <div className="flex items-center justify-center p-10">
            <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-lg font-medium text-indigo-600 dark:text-indigo-400">Đang tải lịch trình...</span>
        </div>
    );
    if (!schedule || !schedule.timeSlots) return (
        <div className="text-center p-10 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800/30">
            <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
            <p>Không tải được dữ liệu lịch trình.</p>
        </div>
    );
    
    return (
        <>
            <div className="my-6 flex items-center justify-center">
                {editingName ? (
                    <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 shadow-md rounded-full px-3 py-2">
                        <input 
                            type="text"
                            value={currentScheduleName}
                            onChange={handleNameChange}
                            onBlur={handleNameSave} 
                            onKeyPress={(e) => { if (e.key === 'Enter') handleNameSave(); }}
                            className="px-3 py-2 bg-transparent border-b-2 border-indigo-300 dark:border-indigo-600 focus:outline-none focus:border-indigo-500 sm:text-lg dark:text-gray-200"
                            autoFocus
                        />
                        <button onClick={handleNameSave} className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"><i className="fas fa-check"></i></button>
                    </div>
                ) : (
                    <h2 
                        className="text-2xl font-semibold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-300 hover:from-indigo-500 hover:to-purple-400 p-2 rounded-full cursor-pointer transition-all duration-200 flex items-center"
                        onClick={() => setEditingName(true)}
                        title="Nhấp để sửa tên lịch trình"
                    >
                        {schedule.name || "Lịch học của tôi"} 
                        <i className="fas fa-pencil-alt text-xs ml-2 text-indigo-600 dark:text-indigo-300 opacity-80 bg-indigo-100 dark:bg-indigo-800/30 p-1.5 rounded-full"></i>
                    </h2>
                )}
            </div>
            
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                <div className="overflow-x-auto" id="tableWrapper">
                    <div className="table-container p-1" id="timetableContentForPdf">
                        <table className="min-w-[900px] w-full border-collapse" id="actualTableToCapture">
                            <thead>
                                <tr className="bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-800 dark:to-indigo-700 text-white">
                                    <th className="border border-indigo-400 dark:border-indigo-600 p-2 md:p-3 w-[100px] md:w-1/12 text-xs md:text-sm rounded-tl-lg">Thời gian</th>
                                    {days.map((day, index) => <th key={day} className={`border border-indigo-400 dark:border-indigo-600 p-2 md:p-3 w-auto text-xs md:text-sm ${index === days.length - 1 ? 'rounded-tr-lg' : ''}`}>{day}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.timeSlots.map((slot, tsIdx) => (
                                    <tr key={slot.time} className={tsIdx % 2 === 0 ? 'bg-gray-50/70 dark:bg-slate-700/30' : 'bg-white/70 dark:bg-slate-800/40'}>
                                        <td className="time-slot border border-gray-200 dark:border-gray-700 p-2 md:p-3 text-xs md:text-sm align-middle font-medium text-center whitespace-nowrap bg-indigo-50/50 dark:bg-indigo-900/20 min-w-[90px]">
                                            <div className="flex flex-col items-center justify-center">
                                                <span className="inline-block w-full text-center">{slot.time}</span>
                                            </div>
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
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-[100] p-4 modal-component">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-white/20 dark:border-slate-700/50 modal-component">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-white">Cài đặt</h3>
                        <button 
                            onClick={onClose} 
                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div className="p-6">
                    <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Chế độ hiển thị</h4>
                        <button 
                            onClick={toggleDarkMode} 
                            className="w-full px-4 py-3 rounded-full font-medium text-white bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 dark:from-slate-700 dark:to-slate-800 dark:hover:from-slate-800 dark:hover:to-slate-900 transition-colors shadow-md flex items-center justify-center"
                        >
                            {settings.darkMode ? <><i className="fas fa-sun mr-2"></i>Chuyển sang chế độ Sáng</> : <><i className="fas fa-moon mr-2"></i>Chuyển sang chế độ Tối</>}
                        </button>
                    </div>

                    <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Màu sắc Môn học/Hoạt động</h4>
                    <div className="space-y-4 mt-4">
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
                        <button onClick={handleSaveColors} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-full text-sm shadow-md">Lưu Thay Đổi Màu Sắc</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ToolsSection = () => {
    const [notificationMessage, setNotificationMessage] = useState("");
    const [downloadMessage, setDownloadMessage] = useState("");
    const { schedule } = useSchedule();

    // Phương pháp đơn giản sử dụng html2canvas để xuất lịch
    const downloadSchedule = async () => {
        setDownloadMessage("Đang chuẩn bị tải xuống lịch học...");
        
        try {
            // Lấy phần tử bảng lịch
            const timetableElement = document.getElementById("actualTableToCapture");
            
            if (!timetableElement) {
                setDownloadMessage("Không tìm thấy bảng lịch để tải xuống.");
                return;
            }
            
            // Ẩn thanh cuộn trước khi chụp
            document.documentElement.classList.add("hide-scrollbar");
            
            // Chuẩn bị bảng để chụp hình
            const tableClone = timetableElement.cloneNode(true);
            
            // Đặt bảng vào DOM nhưng ẩn đi
            tableClone.style.position = "absolute";
            tableClone.style.left = "-9999px";
            tableClone.style.top = "0";
            tableClone.style.width = `${timetableElement.offsetWidth}px`;
            document.body.appendChild(tableClone);
            
            // Đảm bảo tất cả các ô có đúng màu sắc
            Array.from(tableClone.querySelectorAll('td, th')).forEach(cell => {
                const computedStyle = window.getComputedStyle(cell);
                cell.style.backgroundColor = computedStyle.backgroundColor;
                cell.style.color = computedStyle.color;
                cell.style.borderColor = computedStyle.borderColor;
            });
            
            // Cho một khoảng thời gian ngắn để đảm bảo render đầy đủ
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Sử dụng html2canvas với các tùy chọn tối ưu
            const canvas = await html2canvas(tableClone, {
                scale: 2, // Tăng độ phân giải
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff", // Sử dụng màu nền trắng để đảm bảo hiển thị đúng
                logging: false,
                onclone: function(clonedDoc) {
                    const clonedElement = clonedDoc.querySelector("[id='actualTableToCapture']");
                    if (clonedElement) {
                        // Đảm bảo lại một lần nữa các mã màu được thiết lập đúng cách
                        Array.from(clonedElement.querySelectorAll('td, th')).forEach(cell => {
                            const computedStyle = window.getComputedStyle(cell);
                            cell.style.backgroundColor = computedStyle.backgroundColor;
                            cell.style.color = computedStyle.color;
                            cell.style.borderColor = computedStyle.borderColor;
                        });
                    }
                }
            });
            
            // Xóa bảng tạm thời
            document.body.removeChild(tableClone);
            
            // Tạo file image từ canvas
            const imageURL = canvas.toDataURL("image/png");
            
            // Tạo link tải xuống
            const downloadLink = document.createElement("a");
            downloadLink.href = imageURL;
            downloadLink.download = `${schedule.name || "lich-hoc-cua-toi"}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            setDownloadMessage("Tải xuống lịch thành công!");
        } catch (error) {
            console.error("Lỗi khi tải xuống lịch:", error);
            setDownloadMessage(`Lỗi khi tải xuống: ${error.message}`);
            
            // Thử lại với phương pháp đơn giản hơn
            tryAlternativeDownload();
        } finally {
            // Khôi phục thanh cuộn
            document.documentElement.classList.remove("hide-scrollbar");
        }
    };
    
    // Phương pháp thay thế đơn giản hơn trong trường hợp lỗi 
    const tryAlternativeDownload = async () => {
        try {
            setDownloadMessage("Đang thử phương pháp thay thế...");
            
            // Lấy phần tử bảng lịch
            const timetableElement = document.getElementById("actualTableToCapture");
            
            if (!timetableElement) {
                return;
            }
            
            // Đảm bảo tất cả các ô có đúng màu sắc
            const tableClone = timetableElement.cloneNode(true);
            Array.from(tableClone.querySelectorAll('td, th')).forEach(cell => {
                const computedStyle = window.getComputedStyle(cell);
                cell.style.backgroundColor = computedStyle.backgroundColor;
                cell.style.color = computedStyle.color;
                cell.style.borderColor = computedStyle.borderColor;
            });
            
            // Đặt bảng vào DOM nhưng ẩn đi
            tableClone.style.position = "absolute";
            tableClone.style.left = "-9999px";
            tableClone.style.top = "0";
            document.body.appendChild(tableClone);
            
            // Sử dụng html2canvas với tùy chọn tối thiểu
            const canvas = await html2canvas(tableClone, {
                backgroundColor: "#ffffff", // Sử dụng màu nền trắng để đảm bảo hiển thị đúng
                scale: 2,
                useCORS: true
            });
            
            // Xóa bảng tạm thời
            document.body.removeChild(tableClone);
            
            // Tải xuống canvas dưới dạng PNG
            const imageURL = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = imageURL;
            downloadLink.download = `${schedule.name || "lich-hoc-cua-toi"}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            setDownloadMessage("Tải xuống lịch thành công (phương pháp thay thế)!");
        } catch (error) {
            console.error("Lỗi khi tải xuống lịch (phương pháp thay thế):", error);
            setDownloadMessage("Không thể tải xuống lịch. Vui lòng thử lại sau.");
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
        <div className="my-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
                <h3 className="text-lg font-semibold flex items-center">
                    <i className="fas fa-tools mr-2"></i>
                    Công cụ & Tiện ích
                </h3>
            </div>
            <div className="p-5">
                <div className="flex flex-wrap justify-center gap-3 mb-4">
                    <button 
                        onClick={requestNotificationPermission}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-2.5 px-5 rounded-full transition-colors shadow-md flex items-center"
                    >
                        <i className="fas fa-bell mr-2"></i>Bật Thông Báo
                    </button>
                </div>
                
                <div className="flex flex-wrap justify-center gap-3">
                    <button 
                        onClick={downloadSchedule}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 px-5 rounded-full transition-colors shadow-md flex items-center"
                    >
                        <i className="fas fa-download mr-2"></i>Tải Xuống Lịch
                    </button>
                </div>
                {notificationMessage && (
                    <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm flex items-center justify-center">
                        <i className="fas fa-info-circle mr-2"></i>
                        {notificationMessage}
                    </div>
                )}
                {downloadMessage && (
                    <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm flex items-center justify-center">
                        <i className="fas fa-info-circle mr-2"></i>
                        {downloadMessage}
                    </div>
                )}
            </div>
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

// --- Components ---
// ... existing code ...

// Component mới để giải thích phương pháp học
const LearningMethodInfo = () => {
    return (
        <div className="my-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
                <h3 className="text-xl font-semibold flex items-center">
                    <i className="fas fa-info-circle mr-2"></i>
                    Giải Thích Phương Pháp Học
                </h3>
            </div>
            <div className="p-6 space-y-5">
                {/* Method explanations with updated styling */}
                <div className="flex items-start bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mr-4 shadow-md">
                        <i className="fas fa-clock text-white"></i>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-md font-semibold text-purple-700 dark:text-purple-300 mb-1">
                            Học 25p, nghỉ 5p x N lần (Phương pháp Pomodoro):
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            Lặp lại chu kỳ gồm 25 phút tập trung học sâu, sau đó nghỉ ngắn 5 phút. 
                            Thực hiện chu kỳ này N lần. Ví dụ, "học 25p, nghỉ 5p x 4 lần" có nghĩa là: 
                            (25 phút học + 5 phút nghỉ) x 4. Tổng cộng là 100 phút học và 15 phút nghỉ ngắn xen kẽ.
                        </p>
                    </div>
                </div>

                <div className="flex items-start bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800/30">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mr-4 shadow-md">
                        <i className="fas fa-couch text-white"></i>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-md font-semibold text-green-700 dark:text-green-300 mb-1">
                            Nghỉ dài 15p:
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            Sau khi hoàn thành một số chu kỳ Pomodoro (thường là 4), bạn sẽ có một 
                            khoảng thời gian nghỉ dài hơn là 15 phút. Điều này giúp não bộ thư giãn 
                            và tái tạo năng lượng.
                        </p>
                    </div>
                </div>

                <div className="flex items-start bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-4 shadow-md">
                        <i className="fas fa-users text-white"></i>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-md font-semibold text-blue-700 dark:text-blue-300 mb-1">
                            AIO từ 20:00-23:00:
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            Khối thời gian học tập trung 3 giờ liền tục qua Google Meet, không áp dụng 
                            Pomodoro để đảm bảo tính liên mạch.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ... existing code ...

function App() {
    useEffect(() => {
        // Không tải lại Font Awesome vì đã có trong index.html
        // Chỉ tải Tone.js khi cần
        const libraries = [
            { id: 'tonejs-lib', src: 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js' }
        ];

        const loadedScripts = [];
        libraries.forEach(lib => {
            if (!document.getElementById(lib.id)) {
                const script = document.createElement('script');
                script.id = lib.id;
                script.src = lib.src;
                script.async = true; 
                script.onload = () => console.log(`${lib.id} loaded.`);
                script.onerror = () => console.error(`Error loading ${lib.id}.`);
                document.head.appendChild(script);
                loadedScripts.push(script);
            }
        });
        
        return () => {
            // Chỉ loại bỏ script đã thêm vào, không loại bỏ Font Awesome
            loadedScripts.forEach(script => {
                if (script && script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            });
        };
    }, []);

    return (
        <AuthProvider>
            <SettingsProvider>
                <ScheduleProvider>
                    <ActivityNotifier /> 
                    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-900 dark:to-slate-800 text-gray-900 dark:text-gray-100 transition-colors duration-300 relative">
                        <div className="absolute inset-0 bg-grid-pattern"></div>
                        <Navbar />
                        <main className="container mx-auto px-3 py-6 md:px-6 md:py-10 relative z-10">
                            <DailyQuote />
                            <PomodoroTimer />
                            <TimetableGrid />
                            <ToolsSection />
                            <LearningMethodInfo />
                        </main>
                        <footer className="text-center py-6 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                            <div className="container mx-auto">
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <p className="font-medium">Thời Khóa Biểu Pro</p>
                                    <p>Được tạo bởi AI. App ID: {appId}</p>
                                </div>
                            </div>
                        </footer>
                    </div>
                </ScheduleProvider>
            </SettingsProvider>
        </AuthProvider>
    );
}

export default App;
