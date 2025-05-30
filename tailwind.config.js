import forms from '@tailwindcss/forms';

let colors = require('tailwindcss/colors')
colors.myprimary = {
    DEFAULT: "#9F2A2A",
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    950: "#052e16",
}

colors.mysecondary =  {
    DEFAULT: "#00008b",
    50: "#8080c5",
    100: "#6666b9",
    200: "#4d4dae",
    300: "#3333a2",
    400: "#1a1a97",
    500: "#00008b",
    600: "#00007d",
    700: "#00006f",
    800: "#000061",
    900: "#000053",
    950: "#000046",
  },
module.exports = {
    content: [
        './resources/**/*.blade.php',
        './resources/views/vendor/**/*.blade.php',
        './vendor/filament/**/*.blade.php',
        './storage/framework/views/*.php',
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                danger: colors.red,
                // myprimary : colors.myprimary,
                primary: colors.mysecondary,
                secondary: colors.mysecondary,
                success: colors.green,
                warning: colors.yellow,
                background: "#F9F7F4",
            },
            fontFamily: {
                futura: ["futura"],
              },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        // require('@tailwindcss/typography'),
        [forms]
    ],
}