# Gov PM Translator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini-8E75B2)](https://ai.google.dev/)

**Gov PM Translator** is a web application designed for local government employees to reframe and translate their daily administrative tasks into **world-standard Project Management (PMBOK) terminology**.

It runs entirely in the browser (client-side) and offers two modes: **Standard Mode** (keyword-based) and **AI Mode** (using Google Gemini API).

---

## ✨ Features

- **Standard Mode (Dictionary-based)**
  - Instantly maps common tasks (e.g., "handling complaints", "schedule adjustment") to professional PM terms using a built-in dictionary.
  - Fast, free, and requires no API key.
- **AI Mode (Powered by Gemini)**
  - Uses **Google Gemini 2.5 Flash-Lite** to deeply analyze the context of your input.
  - Generates highly accurate and professional definitions tailored to your specific input.
  - _Requires your own Google Gemini API Key._
- **High Security & Privacy**
  - **Client-side only**: No backend server. Your data and API keys are processed locally in your browser and sent directly to Google's API.
  - **Auto-clear**: API keys are stored in `sessionStorage` (cleared when the tab is closed) and can be manually deleted via the UI.
- **Educational Value**
  - Includes a "Debug View" in AI Mode to show the underlying system prompts and raw JSON responses, helping users understand how LLMs work.

---

## 🚀 Quick Start

### Use the Web Version

Go to the GitHub Pages site:
**https://HosoyaYusaku.github.io/gov-pm-translator/**

### Run Locally

1. Clone the repository.
   ```bash
   git clone https://github.com/HosoyaYusaku/gov-pm-translator.git
   cd gov-pm-translator
   ```
2. Install dependencies.
   ```bash
   npm install
   ```
3. Start the development server.
   ```bash
   npm run dev
   ```

---

## 🛡️ Privacy & Security

- **API Key Handling**: If you use AI Mode, your API Key is stored only in your browser's temporary session storage. It is never sent to the developer's server.
- **Data Transmission**: In AI Mode, your input text is sent directly to the Google Gemini API. Please review [Google's Generative AI Terms of Service](https://policies.google.com/terms/generative-ai) regarding data usage.
- **Shared Computers**: If you are using a shared computer, please use the "Trash" icon to clear your API key after use.

---

## 🧩 Tech Stack

- **Framework**: React + Vite + TypeScript
- **UI/Styling**: Tailwind CSS, Lucide React, Framer Motion
- **Export**: html2canvas
- **AI Model**: Google Gemini 2.5 Flash-Lite

---

## 📄 License

This project is licensed under the **MIT License**.  
See [LICENSE](https://www.google.com/search?q=LICENSE) for details.

---

---

# Gov PM Translator (自治体 PM 変換機)

[](https://www.google.com/search?q=LICENSE)

**Gov PM Translator** は、自治体職員が日々行っている「事務作業」を、**世界標準のプロジェクトマネジメント（PMBOK）用語** に置き換えて言語化・翻訳する Web アプリケーションです。

ブラウザ上ですべて完結し、手軽な **スタンダードモード** と、生成 AI を活用した **AI モード** の 2 つを利用できます。

---

## ✨ 主な機能

- **スタンダードモード（辞書ベース）**
  - 「クレーム対応」「日程調整」などのよくある業務を、内蔵辞書を使って瞬時にプロフェッショナルな PM 用語に変換します。
  - 高速・無料・API キー不要で利用できます。
- **AI モード（Gemini 連携）**
  - **Google Gemini 2.5 Flash-Lite** を使用し、入力された文脈を深く読み取って最適な用語と定義を生成します。
  - _利用にはご自身の Google Gemini API キーが必要です。_
- **高いセキュリティとプライバシー**
  - **クライアントサイド完結**: バックエンドサーバーを持ちません。入力データや API キーは開発者のサーバーを経由せず、ブラウザから直接 Google へ送信されます。
  - **安全設計**: API キーは `sessionStorage`（タブを閉じると消える領域）のみに保存され、UI 上から即座に削除も可能です。
- **学習用機能**
  - AI モードには「裏側を覗く（デバッグ）」機能があり、実際にどのようなプロンプト（指示命令）が AI に送られているかを確認できます。DX 研修等の教材としても最適です。

---

## 🚀 使い方

### Web 版を利用する

以下の URL にアクセスしてください（インストール不要）：
**https://HosoyaYusaku.github.io/gov-pm-translator/**

### ローカルで動かす場合

1.  リポジトリをクローン
    ```bash
    git clone https://github.com/HosoyaYusaku/gov-pm-translator.git
    cd gov-pm-translator
    ```
2.  パッケージをインストール
    ```bash
    npm install
    ```
3.  開発サーバーを起動
    ```bash
    npm run dev
    ```

---

## 🛡️ プライバシーとセキュリティ

- **API キーの取り扱い**: AI モードで入力された API キーは、ブラウザの一時ストレージにのみ保存され、開発者には送信されません。
- **データの送信先**: AI モードの入力テキストは、Google Gemini API へ直接送信されます。データの取り扱いについては [Google Generative AI 利用規約](https://policies.google.com/terms/generative-ai) をご確認ください。
- **共用 PC での利用**: 職場の共用 PC などで利用する場合は、使用後に必ず画面内のゴミ箱アイコンを押して API キーを削除してください。

---

## 🧩 技術スタック

- **Framework**: React + Vite + TypeScript
- **UI/Styling**: Tailwind CSS, Lucide React, Framer Motion
- **Export**: html2canvas
- **AI Model**: Google Gemini 2.5 Flash-Lite

---

## 📄 ライセンス

このプロジェクトは **MIT ライセンス** で公開されています。  
詳しくは [LICENSE](https://www.google.com/search?q=LICENSE) をご覧ください。
