// 環境変数設定状況確認スクリプト
const fs = require('fs');
const path = require('path');

console.log('🔍 環境変数設定状況の確認\n');

const envLocalPath = path.join(__dirname, '.env.local');
const envPath = path.join(__dirname, '.env');

// 必要な環境変数
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_GEMINI_API_KEY'
];

// 環境変数ファイルの存在確認
console.log('📁 環境変数ファイルの確認:');
console.log(`  .env.local: ${fs.existsSync(envLocalPath) ? '✅ 存在' : '❌ 存在しない'}`);
console.log(`  .env: ${fs.existsSync(envPath) ? '✅ 存在' : '❌ 存在しない'}\n`);

// .env.localファイルの内容確認
if (fs.existsSync(envLocalPath)) {
  console.log('📄 .env.localファイルの内容:');
  try {
    const content = fs.readFileSync(envLocalPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
    
    if (lines.length === 0) {
      console.log('  ⚠️  ファイルは存在しますが、環境変数が設定されていません\n');
    } else {
      lines.forEach(line => {
        const [key] = line.split('=');
        if (key) {
          console.log(`  ✅ ${key.trim()}`);
        }
      });
      console.log('');
    }
  } catch (error) {
    console.log(`  ❌ ファイルの読み込みエラー: ${error.message}\n`);
  }
} else {
  console.log('⚠️  .env.localファイルが見つかりません\n');
}

// 環境変数の設定状況確認
console.log('🔑 必要な環境変数の確認:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    // 値の一部のみ表示（セキュリティのため）
    const displayValue = value.length > 20 
      ? value.substring(0, 20) + '...' 
      : value;
    console.log(`  ✅ ${envVar}: ${displayValue}`);
  } else {
    console.log(`  ❌ ${envVar}: 設定されていません`);
  }
});

console.log('\n📋 確認結果:');

// 総合評価
const envLocalExists = fs.existsSync(envLocalPath);
const envVarsSet = requiredEnvVars.every(envVar => process.env[envVar]);

if (envLocalExists && envVarsSet) {
  console.log('  ✅ 環境変数は正しく設定されています');
} else if (envLocalExists && !envVarsSet) {
  console.log('  ⚠️  .env.localファイルは存在しますが、環境変数が読み込まれていません');
  console.log('     開発サーバーを再起動してください');
} else {
  console.log('  ❌ 環境変数ファイルが存在しません');
  console.log('     .env.localファイルを作成して、必要な環境変数を設定してください');
}

console.log('\n📝 必要な環境変数:');
console.log('  NEXT_PUBLIC_SUPABASE_URL=あなたのSupabaseプロジェクトURL');
console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabase匿名キー');
console.log('  NEXT_PUBLIC_GEMINI_API_KEY=あなたのGemini APIキー');



