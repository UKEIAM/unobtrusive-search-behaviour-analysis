import React from 'react'

import { create } from 'zustand'



const useStore = create((set) => ({
    screen: true,
    navigation: true,
    mouse: true,


    handleCheckScreen: () => set((state) => ({
        screen: !state.screen })),

    handleCheckNavigation: () => set((state) => ({
        navigation: !state.navigation })),

    handleCheckMouse: () => set((state) => ({
        mouse: !state.mouse })),

    resetCheckBox: () => set(() => ({
        screen: true,
        navigation: true,
        mouse: true
    }))
}))
export default useStore;