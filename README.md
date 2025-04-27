# Syllabus Learning Assistant

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

3. Create a `.env.local` file in the root directory and add your Gemini API key:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

You can get a Gemini API key from the [Google AI Studio](https://makersuite.google.com/app/apikey).

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

The easiest way to deploy this app is with Vercel:

1. Push your code to a Git repository (GitHub, GitLab, BitBucket)
2. Import the project in Vercel
3. Add your environment variables (NEXT_PUBLIC_GEMINI_API_KEY)
4. Deploy

## License

[MIT](https://choosealicense.com/licenses/mit/)
