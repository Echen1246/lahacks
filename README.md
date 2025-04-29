# Syllabus Learning Assistant

URL: https://lahacks-kpg2-2cjvqzcg6-echen1246s-projects.vercel.app/
Devpost: https://devpost.com/software/syllab-ai

This application helps students learn from their course syllabi by extracting text from uploaded syllabi (image, PDF, or text) and using Google's Gemini 2.0 Flash API to generate:

1. A chronological list of YouTube videos covering the course topics
2. A comprehensive study guide organized by topics

## Features

- Upload syllabus in image, PDF, or text format
- Extract text using OCR (Tesseract.js) and PDF processing
- Generate chronological video recommendations with the Gemini API
- Create a detailed study guide for course topics
- Modern responsive UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- A Google Gemini API key
- A YouTube Data API v3 key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lahacks-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your API keys:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
```

You can get a Gemini API key from the [Google AI Studio](https://makersuite.google.com/app/apikey).
You can get a YouTube Data API key from the [Google Cloud Console](https://console.cloud.google.com/apis/library/youtube.googleapis.com).

### Running the Application

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Upload a syllabus file (image, PDF, or text) by dragging and dropping or clicking the upload area
2. Wait for the text extraction and processing
3. View the recommended videos and study guide in the tabs
4. Click on videos to expand and watch embedded content

## Technologies Used

- **Frontend**: Next.js with React, TypeScript, Tailwind CSS
- **OCR/Text Extraction**: Tesseract.js (images), pdf.js (PDFs)
- **AI**: Google Gemini 2.0 Flash API
- **Deployment**: Ready for Vercel deployment

## Deployment

The recommended way to deploy this Next.js application is using [Vercel](https://vercel.com/).

1. Push your code to a Git repository (e.g., GitHub, GitLab, Bitbucket).
2. **Sign up or Log in** to Vercel using your Git provider account.
3. **Import Project**: Click "Add New..." > "Project" and select the Git repository you pushed your code to.
4. **Configure Project**: Vercel should automatically detect that this is a Next.js project and configure the build settings correctly.
5. **Add Environment Variables**: Navigate to the project settings > "Environment Variables". Add the following variables:
   - `NEXT_PUBLIC_GEMINI_API_KEY`: Your Google Gemini API key.
   - `NEXT_PUBLIC_YOUTUBE_API_KEY`: Your YouTube Data API v3 key.
   *Ensure these are set for all environments (Production, Preview, Development).*
6. **Deploy**: Click the "Deploy" button. Vercel will build and deploy your application.

Your site will be deployed to a `.vercel.app` URL. You can also add a custom domain later through the Vercel dashboard.

## License

[MIT](https://choosealicense.com/licenses/mit/)
