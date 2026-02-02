import { atom } from "jotai";

const localPhoto = localStorage.getItem("photo");
console.log(localPhoto)
export const profileAtom = atom<string>('');