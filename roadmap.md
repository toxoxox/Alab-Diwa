 # **Step-by-Step Guide to Building the Alab Diwa Journalism Club Website Using HTML, CSS, and JavaScript**

Building the Alab Diwa Journalism Club website using only HTML, CSS, and JavaScript involves creating each component step by step. This guide will walk you through the process of building each part of the website, ensuring that it's structured, styled, and interactive.

---

## **Prerequisites**

Before you begin, make sure you have the following:

- A code editor (e.g., Visual Studio Code, Sublime Text, Atom)
- Basic knowledge of HTML, CSS, and JavaScript
- A modern web browser for testing (e.g., Google Chrome, Firefox)

---

## **Project Setup**

### **1. Create the Project Folder**

- **Create a folder** for your project, e.g., `alab-diwa-website`.

### **2. Set Up the Project Structure**

Inside your project folder, create the following files and folders:

- **HTML Files**:
  - `index.html` (Homepage)
  - `articles.html` (Articles Page)
  - `events.html` (Events Page)
  - `about.html` (About Us Page)
- **CSS Folder**:
  - `css/styles.css` (Main stylesheet)
- **JavaScript Folder**:
  - `js/main.js` (Main JavaScript file)
- **Images Folder**:
  - `images/` (For all images and assets)
- **Fonts Folder** (Optional):
  - `fonts/` (For custom fonts)

---

## **Building the Website Components**

### **Step 1: Set Up the Basic HTML Structure**

#### **1.1. Create the HTML Boilerplate**

In each HTML file, add the basic HTML structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Alab Diwa Journalism Club</title>
  <link rel="stylesheet" href="css/styles.css">
  <!-- Add any additional meta tags or links here -->
</head>
<body>
  <!-- Content goes here -->

  <script src="js/main.js"></script>
</body>
</html>
```

#### **1.2. Include Common Elements**

To maintain consistency, you might consider using server-side includes or JavaScript to include common elements like the navigation bar and footer across all pages.

---

### **Step 2: Build the Navigation Bar**

#### **2.1. Add Navigation HTML**

In the `<body>` section of each page, add the navigation bar at the top:

```html
<!-- Navigation Bar -->
<nav>
  <div class="container">
    <div class="logo">
      <a href="index.html">Alab Diwa</a>
    </div>
    <ul class="nav-links">
      <li><a href="index.html">Home</a></li>
      <li><a href="articles.html">Articles</a></li>
      <li><a href="events.html">Events</a></li>
      <li><a href="about.html">About Us</a></li>
    </ul>
    <div class="burger">
      <div class="line1"></div>
      <div class="line2"></div>
      <div class="line3"></div>
    </div>
  </div>
</nav>
```

#### **2.2. Style the Navigation Bar**

In `css/styles.css`, add styles for the navigation bar:

```css
/* Reset some default styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Navigation Bar Styles */
nav {
  background-color: #333;
  height: 80px;
  width: 100%;
}

nav .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: auto;
  padding: 0 20px;
}

nav .logo a {
  color: #fff;
  text-decoration: none;
  font-size: 24px;
  font-weight: bold;
}

nav .nav-links {
  list-style: none;
  display: flex;
}

nav .nav-links li {
  margin-left: 20px;
}

nav .nav-links a {
  color: #fff;
  text-decoration: none;
  font-size: 18px;
}

nav .burger {
  display: none;
  cursor: pointer;
}

nav .burger div {
  width: 25px;
  height: 3px;
  background-color: #fff;
  margin: 5px;
}

/* Responsive Styles */
@media screen and (max-width: 768px) {
  nav .nav-links {
    position: absolute;
    right: 0;
    height: 100vh;
    top: 80px;
    background-color: #333;
    flex-direction: column;
    align-items: center;
    width: 50%;
    transform: translateX(100%);
    transition: transform 0.5s ease-in;
  }

  nav .nav-links li {
    margin: 50px 0;
  }

  nav .nav-links.active {
    transform: translateX(0%);
  }

  nav .burger {
    display: block;
  }
}
```

#### **2.3. Add JavaScript for Mobile Navigation**

In `js/main.js`, add the following:

```javascript
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  burger.classList.toggle('toggle');
});
```

---

### **Step 3: Implement the Loader Animation**

#### **3.1. Add the Loader HTML**

In `index.html`, add the loader at the very top inside the `<body>` tag:

```html
<!-- Loader -->
<div id="loader">
  <div class="loader-content">
    <!-- Custom Animation Icon (Flame or Pen) -->
    <img src="images/loader-icon.png" alt="Loading...">

    <!-- Typewriter Effect Text -->
    <h1 id="typewriter">Alab Diwa</h1>
  </div>
</div>
```

#### **3.2. Style the Loader**

In `css/styles.css`:

```css
/* Loader Styles */
#loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loader-content {
  text-align: center;
}

.loader-content img {
  width: 100px;
  animation: rotate 2s linear infinite;
}

.loader-content #typewriter {
  font-size: 32px;
  margin-top: 20px;
  overflow: hidden; /* Ensures the text is not visible until typed */
  white-space: nowrap; /* Keeps the text on a single line */
  border-right: 3px solid #000; /* Adds a cursor */
  width: 0; /* Initially set width to zero */
  animation: typing 3s steps(15, end) forwards;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 200px; /* Adjust based on text length */
  }
}
```

#### **3.3. Add JavaScript to Remove Loader**

In `js/main.js`:

```javascript
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  loader.style.opacity = '0';
  setTimeout(() => {
    loader.style.display = 'none';
  }, 500);
});
```

---

### **Step 4: Create the Homepage (index.html)**

#### **4.1. Hero Section**

Add the hero section HTML below the navigation bar:

```html
<!-- Hero Section -->
<section id="hero">
  <div class="hero-content">
    <h1>Igniting Passion for Journalism</h1>
    <p>Join us in our journey to inform, inspire, and engage.</p>
  </div>
</section>
```

#### **4.2. Style the Hero Section**

In `css/styles.css`:

```css
/* Hero Section Styles */
#hero {
  height: 100vh;
  background: url('images/hero-background.jpg') center center/cover no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
}

#hero .hero-content {
  text-align: center;
  color: #fff;
  padding: 20px;
}

#hero h1 {
  font-size: 48px;
  margin-bottom: 20px;
}

#hero p {
  font-size: 24px;
}
```

---

### **Step 5: Build the "About Alab Diwa" Section**

#### **5.1. Add the About Section HTML**

After the hero section in `index.html`:

```html
<!-- About Alab Diwa Section -->
<section id="about">
  <div class="container">
    <h2>About Alab Diwa</h2>
    <p>Here you can write a brief history and mission statement of the club.</p>
    <div class="statistics">
      <div class="stat">
        <img src="images/icon-award.png" alt="Award Icon">
        <h3>10+</h3>
        <p>Awards Won</p>
      </div>
      <div class="stat">
        <img src="images/icon-members.png" alt="Members Icon">
        <h3>50+</h3>
        <p>Active Members</p>
      </div>
      <!-- Add more statistics as needed -->
    </div>
  </div>
</section>
```

#### **5.2. Style the About Section**

In `css/styles.css`:

```css
/* About Section Styles */
#about {
  padding: 60px 20px;
}

#about .container {
  max-width: 1200px;
  margin: auto;
  text-align: center;
}

#about h2 {
  font-size: 36px;
  margin-bottom: 20px;
}

#about p {
  font-size: 18px;
  margin-bottom: 40px;
}

#about .statistics {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

#about .stat {
  flex: 1 1 200px;
  margin: 20px;
}

#about .stat img {
  width: 80px;
  margin-bottom: 10px;
}

#about .stat h3 {
  font-size: 28px;
}

#about .stat p {
  font-size: 16px;
}
```

---

### **Step 6: Implement the "Recent News/Updates" Section**

#### **6.1. Add the News Section HTML**

```html
<!-- Recent News/Updates Section -->
<section id="news">
  <div class="container">
    <h2>Recent News</h2>
    <div class="articles">
      <!-- Article 1 -->
      <div class="article">
        <img src="images/article1.jpg" alt="Article Title">
        <h3>Article Title 1</h3>
        <p>Short excerpt from the article to give readers a glimpse...</p>
        <a href="articles.html">Read More</a>
      </div>
      <!-- Article 2 -->
      <div class="article">
        <img src="images/article2.jpg" alt="Article Title">
        <h3>Article Title 2</h3>
        <p>Short excerpt from the article to give readers a glimpse...</p>
        <a href="articles.html">Read More</a>
      </div>
      <!-- Article 3 -->
      <div class="article">
        <img src="images/article3.jpg" alt="Article Title">
        <h3>Article Title 3</h3>
        <p>Short excerpt from the article to give readers a glimpse...</p>
        <a href="articles.html">Read More</a>
      </div>
    </div>
  </div>
</section>
```

#### **6.2. Style the News Section**

```css
/* News Section Styles */
#news {
  padding: 60px 20px;
  background-color: #f9f9f9;
}

#news .container {
  max-width: 1200px;
  margin: auto;
}

#news h2 {
  text-align: center;
  font-size: 36px;
  margin-bottom: 40px;
}

#news .articles {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

#news .article {
  flex: 1 1 300px;
  margin: 20px;
  background: #fff;
  padding: 15px;
  text-align: center;
  border: 1px solid #ddd;
}

#news .article img {
  width: 100%;
  height: auto;
}

#news .article h3 {
  font-size: 24px;
  margin: 15px 0;
}

#news .article p {
  font-size: 16px;
}

#news .article a {
  display: inline-block;
  margin-top: 10px;
  color: #007BFF;
  text-decoration: none;
}

#news .article a:hover {
  text-decoration: underline;
}
```

---

### **Step 7: Create the "Contributing Members" Section**

#### **7.1. Add the Members Section HTML**

```html
<!-- Contributing Members Section -->
<section id="members">
  <div class="container">
    <h2>Contributing Members</h2>
    <div class="members-grid">
      <!-- Member 1 -->
      <div class="member">
        <img src="images/member1.jpg" alt="Member Name">
        <h3>Member Name</h3>
        <p>Role and Achievements</p>
      </div>
      <!-- Member 2 -->
      <div class="member">
        <img src="images/member2.jpg" alt="Member Name">
        <h3>Member Name</h3>
        <p>Role and Achievements</p>
      </div>
      <!-- Add more members as needed -->
    </div>
  </div>
</section>
```

#### **7.2. Style the Members Section**

```css
/* Members Section Styles */
#members {
  padding: 60px 20px;
}

#members .container {
  max-width: 1200px;
  margin: auto;
  text-align: center;
}

#members h2 {
  font-size: 36px;
  margin-bottom: 40px;
}

#members .members-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

#members .member {
  flex: 1 1 200px;
  margin: 20px;
  text-align: center;
}

#members .member img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
}

#members .member h3 {
  font-size: 22px;
  margin: 15px 0;
}

#members .member p {
  font-size: 16px;
}
```

---

### **Step 8: Develop the "Club Activities" Section**

#### **8.1. Add the Activities Section HTML**

```html
<!-- Club Activities Section -->
<section id="activities">
  <div class="container">
    <h2>Club Activities</h2>
    <div class="activities-grid">
      <!-- Activity 1 -->
      <div class="activity">
        <img src="images/activity1.jpg" alt="Activity Title">
        <h3>Activity Title 1</h3>
        <p>Date: January 1, 2023</p>
        <p>Brief description of the activity...</p>
      </div>
      <!-- Activity 2 -->
      <div class="activity">
        <img src="images/activity2.jpg" alt="Activity Title">
        <h3>Activity Title 2</h3>
        <p>Date: February 14, 2023</p>
        <p>Brief description of the activity...</p>
      </div>
      <!-- Add more activities as needed -->
    </div>
  </div>
</section>
```

#### **8.2. Style the Activities Section**

```css
/* Activities Section Styles */
#activities {
  padding: 60px 20px;
  background-color: #f9f9f9;
}

#activities .container {
  max-width: 1200px;
  margin: auto;
  text-align: center;
}

#activities h2 {
  font-size: 36px;
  margin-bottom: 40px;
}

#activities .activities-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

#activities .activity {
  flex: 1 1 300px;
  margin: 20px;
  background: #fff;
  padding: 15px;
  border: 1px solid #ddd;
}

#activities .activity img {
  width: 100%;
  height: auto;
}

#activities .activity h3 {
  font-size: 24px;
  margin: 15px 0;
}

#activities .activity p {
  font-size: 16px;
}
```

---

### **Step 9: Add the "Call to Action" Section**

#### **9.1. Add the Call to Action HTML**

```html
<!-- Call to Action Section -->
<section id="cta">
  <div class="container">
    <h2>Join Alab Diwa</h2>
    <p>Become a part of our vibrant journalism community.</p>
    <a href="about.html" class="cta-button">Get Involved</a>
  </div>
</section>
```

#### **9.2. Style the Call to Action Section**

```css
/* Call to Action Styles */
#cta {
  padding: 60px 20px;
  background-color: #333;
  color: #fff;
}

#cta .container {
  max-width: 1200px;
  margin: auto;
  text-align: center;
}

#cta h2 {
  font-size: 36px;
  margin-bottom: 20px;
}

#cta p {
  font-size: 18px;
  margin-bottom: 30px;
}

#cta .cta-button {
  display: inline-block;
  padding: 15px 30px;
  background-color: #007BFF;
  color: #fff;
  text-decoration: none;
  font-size: 18px;
  border-radius: 5px;
}

#cta .cta-button:hover {
  background-color: #0056b3;
}
```

---

### **Step 10: Create the Footer**

#### **10.1. Add the Footer HTML**

At the bottom of each page, before the closing `</body>` tag:

```html
<!-- Footer -->
<footer>
  <div class="container">
    <p>&copy; 2023 Alab Diwa Journalism Club. All rights reserved.</p>
    <div class="social-links">
      <a href="https://facebook.com"><img src="images/facebook-icon.png" alt="Facebook"></a>
      <a href="https://twitter.com"><img src="images/twitter-icon.png" alt="Twitter"></a>
      <!-- Add more social media icons -->
    </div>
  </div>
</footer>
```

#### **10.2. Style the Footer**

```css
/* Footer Styles */
footer {
  background-color: #333;
  color: #fff;
  padding: 20px 0;
}

footer .container {
  max-width: 1200px;
  margin: auto;
  text-align: center;
}

footer p {
  margin-bottom: 10px;
}

footer .social-links a {
  margin: 0 10px;
}

footer .social-links img {
  width: 24px;
  height: auto;
}
```

---

### **Step 11: Build Additional Pages**

#### **11.1. Articles Page (`articles.html`)**

- **Layout**: Use a grid layout similar to the "Recent News" section.
- **Filter/Sort Options**: Implement buttons or dropdowns for filtering articles by category or date (requires JavaScript if functional).

#### **11.2. Events Page (`events.html`)**

- **Layout**: List events in chronological order or use a calendar view (requires additional JS or calendar library).
- **Past/Upcoming Events**: Separate sections or tabs for past and upcoming events.

#### **11.3. About Us Page (`about.html`)**

- **Mission and Vision**: Write detailed mission and vision statements.
- **Leadership Team**: Use a layout similar to the "Contributing Members" section.
- **Member Testimonials**: Add a section with testimonials using a simple carousel or sliders (requires JavaScript).

---

### **Step 12: Implement Additional Functionalities**

#### **12.1. Search Functionality**

- **Add a Search Bar**: Place it in the navigation bar or on the articles/events pages.
- **JavaScript Logic**: Use JavaScript to filter displayed content based on user input.
  - Since there's no back-end, data can be stored in JavaScript arrays or objects.

#### **12.2. Newsletter Subscription**

- **Add a Subscription Form**:

  ```html
  <!-- Newsletter Section -->
  <section id="newsletter">
    <div class="container">
      <h2>Subscribe to Our Newsletter</h2>
      <form id="newsletter-form">
        <input type="email" placeholder="Enter your email" id="newsletter-email" required>
        <button type="submit">Subscribe</button>
      </form>
    </div>
  </section>
  ```

- **Style the Form**:

  ```css
  /* Newsletter Section Styles */
  #newsletter {
    padding: 60px 20px;
    background-color: #f9f9f9;
  }

  #newsletter .container {
    max-width: 600px;
    margin: auto;
    text-align: center;
  }

  #newsletter h2 {
    font-size: 32px;
    margin-bottom: 20px;
  }

  #newsletter form {
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
  }

  #newsletter input[type="email"] {
    padding: 10px;
    font-size: 16px;
    flex: 1;
    border: 1px solid #ccc;
    border-right: none;
  }

  #newsletter button {
    padding: 10px 20px;
    background-color: #007BFF;
    color: #fff;
    border: none;
    cursor: pointer;
  }

  #newsletter button:hover {
    background-color: #0056b3;
  }
  ```

- **JavaScript Handling**:

  ```javascript
  const newsletterForm = document.getElementById('newsletter-form');

  newsletterForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value;
    // Here you can implement functionality to send the email to your server
    alert(`Thank you for subscribing, ${email}!`);
    newsletterForm.reset();
  });
  ```

---

### **Step 13: Make the Website Responsive**

#### **13.1. Use Flexbox and Media Queries**

- Ensure that all sections use flexible units (`%, em, rem`) where possible.
- Adjust layouts for smaller screens using CSS media queries.

#### **13.2. Test on Different Devices**

- Use browser dev tools to simulate different screen sizes.
- Check on actual mobile devices if possible.

---

### **Step 14: Add Interactivity and Enhancements**

#### **14.1. Carousel for Club Activities**

- Implement a simple carousel using JavaScript or include a lightweight carousel library.

#### **14.2. Smooth Scrolling**

- Enable smooth scrolling for anchor links using CSS or JavaScript.

```css
html {
  scroll-behavior: smooth;
}
```

#### **14.3. Scroll Animations**

- Use JavaScript to add animations when elements come into view (e.g., fade-in effects).

#### **14.4. Form Validation**

- Add JavaScript validation for forms (e.g., contact forms, newsletter subscription).

#### **14.5. Back-to-Top Button**

- Add a button that appears when the user scrolls down, allowing them to return to the top of the page.

---

### **Step 15: Optimize and Validate**

#### **15.1. Optimize Images**

- Compress images to reduce load times without compromising quality.

#### **15.2. Minify CSS and JavaScript**

- For production, minify your CSS and JS files to improve performance.

#### **15.3. HTML Validation**

- Use the [W3C Markup Validation Service](https://validator.w3.org/) to validate your HTML.

#### **15.4. CSS Validation**

- Use the [W3C CSS Validation Service](https://jigsaw.w3.org/css-validator/) to validate your CSS.

#### **15.5. JavaScript Testing**

- Test your JavaScript in different browsers to ensure compatibility.

---

### **Step 16: Deployment**

#### **16.1. Choose a Hosting Platform**

- Options include GitHub Pages, Netlify, Vercel, or any web hosting service that supports HTML, CSS, and JavaScript.

#### **16.2. Upload Your Website**

- Follow your chosen platform's instructions to deploy your website.

#### **16.3. Test Live Site**

- Once deployed, test your website online to ensure everything works as expected.

---

## **Conclusion**

By following this step-by-step guide, you'll build the Alab Diwa Journalism Club website, focusing on one part at a time. This approach ensures a structured development process, making it easier to manage and maintain. Remember to test each feature thoroughly before moving on to the next, and don't hesitate to experiment with styles and interactivity to make your website engaging and unique.

---

**Additional Tips:**

- **Keep Your Code Organized**: Use comments and consistent indentation.
- **Stay Consistent with Design**: Use a consistent color scheme and typography across all pages.
- **Accessibility**: Ensure that your website is accessible to users with disabilities by using proper HTML semantics and ARIA labels.
- **SEO Optimization**: Use proper meta tags, titles, and descriptions to improve search engine rankings.
- **Backup Your Work**: Regularly save your work and consider using version control systems like Git.

If you need further assistance or have questions about any of the steps, feel free to ask!