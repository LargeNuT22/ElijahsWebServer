# Elijah Rook - Apex Training Website

A professional personal trainer website built with HTML, CSS, and JavaScript featuring a red and black theme with white text.

## 🎨 Design Features

- **Red & Black Theme**: Professional color scheme with white text for optimal readability
- **Responsive Design**: Fully mobile-friendly and works on all devices
- **Modern Layout**: Clean, professional design that builds trust
- **Easy Navigation**: Clear menu structure with smooth scrolling
- **Interactive Elements**: Hover effects, animations, and form validation

## 📁 File Structure

```
ElijahsWebsite/
├── index.html          # Home page
├── about.html           # About Elijah page
├── programs.html        # Training programs and pricing
├── contact.html         # Contact form and information
├── styles.css           # All styling and responsive design
├── script.js           # Interactive functionality
├── Logo/               # Logo and images folder
└── README.md           # This file
```

## ✏️ How to Customize Content

### 1. Changing Text Content

**Personal Information (Multiple files)**
- Search for "Elijah Rook" to replace with different name
- Search for "elijah@apextraining.com" to update email
- Search for "(555) 123-4567" to update phone number
- Search for "Your City, State" to update location

**Business Name**
- Search for "Apex Training" to change business name
- Update the logo text in the navigation

**Hero Section (`index.html` lines 35-50)**
```html
<h1 class="hero-title">Transform Your Fitness Journey</h1>
<h2 class="hero-subtitle">with <span class="highlight">Elijah Rook</span></h2>
<p class="hero-description">
    Professional Personal Training • Customized Workout Plans • Nutritional Guidance
</p>
```

**About Page Content (`about.html` lines 45-65)**
- Update the trainer bio and background
- Modify certifications and specializations
- Change the training philosophy quote

**Programs and Pricing (`programs.html`)**
- Update program descriptions (lines 45-200)
- Change pricing (search for "$" to find all prices)
- Modify package details (lines 200-300)

### 2. Adding/Changing Images

**Logo**
- Replace the logo file in the `Logo/` folder
- Update the logo filename in all HTML files (search for "20250827_0904_Apex Training Logo")

**Profile Photos**
- Profile photo has been added to the About and Home pages using `Profile picture/85654423.jpg`
- To change the photo, simply replace this file with your new image
- Or update the image path in the HTML files:
```html
<img src="Profile picture/85654423.jpg" alt="Elijah Rook" class="trainer-photo">
```

**Adding New Images**
1. Create an `images/` folder
2. Add your photos (recommended: JPG format, max 1MB each)
3. Update the HTML to reference your images

### 3. Modifying Colors

**Main Colors (`styles.css` lines 9-18)**
```css
:root {
    --primary-red: #dc2626;    /* Main red color */
    --dark-red: #991b1b;       /* Darker red for hover effects */
    --black: #000000;          /* Background black */
    --white: #ffffff;          /* Text white */
}
```

**To change the red theme:**
1. Replace `--primary-red` with your preferred color
2. Replace `--dark-red` with a darker version
3. All buttons and accents will automatically update

### 4. Contact Information

**Update Contact Details (`contact.html` lines 110-150)**
```html
<div class="contact-details">
    <h3>Email</h3>
    <p>your-email@domain.com</p>
</div>
```

**Training Hours (lines 155-165)**
- Modify the schedule to match your availability

**Contact Form**
- The form is already set up to collect inquiries
- To make it functional, you'll need to add backend processing
- Currently shows a success message when submitted

### 5. Programs and Services

**Adding New Programs (`programs.html`)**
1. Copy an existing program card (lines 45-85)
2. Update the content:
   - Program name
   - Price
   - Description
   - Features list
   - Duration

**Modifying Packages**
- Update pricing in the packages section (lines 200-300)
- Change what's included in each package

### 6. SEO and Meta Information

**Page Titles (in `<head>` section of each file)**
```html
<title>Your Custom Title Here</title>
```

**Adding Meta Descriptions**
Add this to each page's `<head>` section:
```html
<meta name="description" content="Your page description here">
```

## 🚀 Getting Started

1. **Open the website**: Double-click `index.html` to open in your web browser
2. **Test all pages**: Navigate through all sections to ensure everything works
3. **Customize content**: Follow the instructions above to personalize
4. **Add your images**: Replace placeholders with actual photos
5. **Test responsiveness**: View on mobile devices or resize browser window

## 📱 Mobile Responsiveness

The website is fully responsive and includes:
- Collapsible mobile navigation menu
- Optimized layouts for tablets and phones
- Touch-friendly buttons and forms
- Readable text sizes on all devices

## 🔧 Technical Features

- **Smooth scrolling navigation**
- **Form validation and feedback**
- **Hover animations and effects**
- **Mobile hamburger menu**
- **Back-to-top button**
- **Loading animations for content**

## 📞 Need Help?

If you need assistance customizing the website:
1. Most changes only require editing text in the HTML files
2. Color changes are made in the CSS file's `:root` section
3. Keep backups of original files before making changes
4. Test changes in a web browser after editing

## 🌐 Going Live

To publish your website:
1. Choose a web hosting service
2. Upload all files to your hosting account
3. Point your domain to the hosting service
4. Your website will be live!

Popular hosting options:
- Netlify (free)
- GitHub Pages (free)
- Hostinger
- Bluehost
- GoDaddy

---

**Enjoy your new professional trainer website! 💪**
