import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = false;

  constructor() {
    // Al cargar la web, revisa si el usuario ya prefería el modo oscuro
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (theme === 'dark' || (!theme && prefersDark)) {
      this.enableDarkMode();
    }
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    this.darkMode ? this.enableDarkMode() : this.disableDarkMode();
  }

  private enableDarkMode() {
    this.darkMode = true;
    document.documentElement.classList.add('dark'); // Esto activa el dark: de Tailwind
    localStorage.setItem('theme', 'dark');
  }

  private disableDarkMode() {
    this.darkMode = false;
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }

  isDark() {
    return this.darkMode;
  }
}