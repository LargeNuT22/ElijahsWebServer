# Elijah Rook - Divinity Health and Fitness

A professional personal training team website built with HTML, CSS, and JavaScript featuring a **blue, white, and black theme** inspired by modern gym aesthetics.

## 🎨 Design Features

- **Blue & Black Theme**: Modern color scheme with blue accents, black backgrounds, and white text
- **Dynamic Background Elements**: Angular SVG patterns inspired by gym flyer design
- **Team-Focused Layout**: Showcasing 4 professional trainers with individual profiles
- **Gym Image Placeholders**: Ready spaces for gym photos throughout the site
- **Responsive Design**: Fully mobile-friendly and works on all devices
- **Modern Layout**: Clean, professional design that builds trust
- **Easy Navigation**: Clear menu structure with smooth scrolling
- **Interactive Elements**: Hover effects, animations, and form validation

## 👥 Team Structure

The website showcases a professional training team:
- **Elijah Rook** - Lead Personal Trainer & Founder
- **3 Additional Trainers** - Each with specialized expertise areas
- **Group Team Photo** - Featured on homepage hero section
- **Individual Profiles** - Detailed trainer information and specialties

## 🏋️ Gym Image Integration

The website includes placeholder spaces for gym photos:
- **Home Page**: 3 gym equipment/training area photos
- **About Page**: 2 training session photos  
- **Programs Page**: 3 facility area photos
- **Contact Page**: 2 location/atmosphere photos

## 📁 File Structure

```
ElijahsWebsite/
├── index.html          # Home page with team layout and blue theme
├── about.html           # About the training team page
├── programs.html        # Training programs and pricing
├── contact.html         # Contact form and information
├── styles.css           # Blue theme styling and responsive design
├── script.js           # Interactive functionality
├── Logo/               # Logo files (Picture 1.png - heart with wings logo)
├── Profile picture/    # Trainer photos
└── README.md           # This file
```

## ✏️ How to Customize Content

### 1. Changing Text Content

**Personal Information (Multiple files)**
- Search for "Elijah Rook" to replace with different name
- Search for "elijah@divinityhealthfitness.com" to update email
- Search for "(555) 123-4567" to update phone number
- Search for "Your City, State" to update location

**Business Name**
- Search for "Divinity Health and Fitness" to change business name
- Update the logo text in the navigation

**Team Information**
- Update individual trainer names, titles, and specialties in `index.html`
- Modify trainer bios and credentials
- Add or remove team members as needed

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
- Current logo: `Picture 1.png` (heart with wings and cross design)
- Replace the logo file in the `Logo/` folder
- Update the logo filename in all HTML files if changing the filename

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

**Main Colors (`styles.css` lines 9-22)**
```css
:root {
    --primary-blue: #1E90FF;   /* Main blue color */
    --dark-blue: #1873CC;      /* Darker blue for hover effects */
    --light-blue: #4AA6FF;     /* Light blue accent */
    --accent-blue: #00BFFF;    /* Bright blue highlights */
    --black: #000000;          /* Background black */
    --white: #ffffff;          /* Text white */
}
```

**To change the blue theme:**
1. Replace `--primary-blue` with your preferred color
2. Replace `--dark-blue` with a darker version
3. Replace `--light-blue` and `--accent-blue` with matching tones
4. All buttons, borders, and accents will automatically update

### 4. Adding Your Gym Photos

**Replace Gym Placeholders:**
The website has placeholders for gym photos that you can easily replace:

1. **Home Page** (`index.html` lines 62-67):
   - Gym Equipment Photo 1
   - Training Area Photo 2  
   - Workout Space Photo 3

2. **About Page** (`about.html` lines 79-82):
   - Training Session Photo
   - Gym Floor Photo

3. **Programs Page** (`programs.html` lines 51-55):
   - Weight Training Area
   - Cardio Equipment Zone
   - Functional Training Space

4. **Contact Page** (`contact.html` lines 51-54):
   - Gym Location & Facility
   - Personal Training Sessions

**To replace placeholders with actual photos:**
```html
<!-- Replace team group photo -->
<div class="gym-image-placeholder group-photo">📸 Team Group Photo</div>
<!-- With actual image -->
<img src="team-photos/group-photo.jpg" alt="Training Team" class="group-photo">

<!-- Replace individual trainer photos -->
<div class="placeholder-image trainer-image">👤 Lead Trainer Photo</div>
<!-- With actual image -->
<img src="trainer-photos/elijah.jpg" alt="Elijah Rook" class="trainer-image">
```

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
