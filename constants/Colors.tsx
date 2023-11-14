// global css defaults
// I'm not sure how i want to approach this, as it would be nice to implement a dynamic light-dark mode switching.
// I think we will have a main enum which will be a dynamic reference to the light colors and the dark colors.
enum CssColors {
    primaryElement = '#111',
    minorElement = '#555',
    primaryBackground = '#FFF',
    minorBackground = '#CCC',
    primaryAccent = '#9D1B31', // probed from AIC's logo
    minorAccent = '#AE4355' // probed from a blurred AIC's logo
}

export default CssColors;