/**
 * Supabase接続テストスクリプト
 * 
 * このスクリプトは、Supabaseへの接続が正常に機能しているかを確認します。
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

console.log('🔍 Supabase接続テストを開始します...\n')

// 環境変数の取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 環境変数の確認
console.log('📋 環境変数の確認:')
console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ 設定済み' : '❌ 未設定'}`)
if (supabaseUrl) {
  console.log(`    URL: ${supabaseUrl}`)
} else {
  console.log('    ⚠️  .env.localファイルにNEXT_PUBLIC_SUPABASE_URLが設定されていません')
}

console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ 設定済み' : '❌ 未設定'}`)
if (supabaseAnonKey) {
  const keyPreview = supabaseAnonKey.substring(0, 20) + '...'
  console.log(`    Key: ${keyPreview}`)
} else {
  console.log('    ⚠️  .env.localファイルにNEXT_PUBLIC_SUPABASE_ANON_KEYが設定されていません')
}

console.log('')

// 環境変数が設定されていない場合
if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ エラー: 環境変数が設定されていません')
  console.log('')
  console.log('📝 解決方法:')
  console.log('1. blog-writer-appディレクトリに.env.localファイルを作成')
  console.log('2. 以下の内容を追加:')
  console.log('')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here')
  console.log('')
  console.log('3. Supabase Dashboardから正しい値を取得して設定')
  console.log('   - Settings > API > Project URL')
  console.log('   - Settings > API > anon public key')
  process.exit(1)
}

// プレースホルダーのチェック
if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
  console.log('⚠️  警告: プレースホルダー値が使用されています')
  console.log('   実際のSupabaseプロジェクトのURLとキーを設定してください')
  console.log('')
}

// Supabaseクライアントの作成
console.log('🔌 Supabaseクライアントを作成中...')
let supabase
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('✅ クライアント作成成功')
} catch (error) {
  console.log('❌ クライアント作成失敗:')
  console.log(`   ${error.message}`)
  process.exit(1)
}

console.log('')

// 接続テスト1: 認証状態の取得
console.log('📡 テスト1: 認証状態の取得...')
supabase.auth.getSession()
  .then(({ data, error }) => {
    if (error) {
      console.log(`   ❌ エラー: ${error.message}`)
      console.log(`   詳細: ${JSON.stringify(error, null, 2)}`)
    } else {
      console.log('   ✅ 認証状態の取得に成功')
      console.log(`   セッション: ${data.session ? 'ログイン中' : '未ログイン'}`)
    }
    return testDatabaseConnection()
  })
  .catch((error) => {
    console.log(`   ❌ 例外エラー: ${error.message}`)
    if (error.message.includes('Failed to fetch')) {
      console.log('   ⚠️  ネットワークエラー: Supabase URLが正しいか確認してください')
    }
    return testDatabaseConnection()
  })

// 接続テスト2: データベース接続（profilesテーブル）
async function testDatabaseConnection() {
  console.log('')
  console.log('📡 テスト2: データベース接続（profilesテーブル）...')
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log(`   ❌ エラー: ${error.message}`)
      console.log(`   コード: ${error.code}`)
      console.log(`   詳細: ${error.details || 'なし'}`)
      
      if (error.code === 'PGRST116') {
        console.log('   ⚠️  テーブルが存在しない可能性があります')
        console.log('   📝 解決方法: Supabase Dashboardでprofilesテーブルを作成してください')
      } else if (error.message.includes('JWT')) {
        console.log('   ⚠️  APIキーが無効な可能性があります')
        console.log('   📝 解決方法: Supabase Dashboardで正しいanon keyを確認してください')
      }
    } else {
      console.log('   ✅ データベース接続成功')
      console.log('   ✅ profilesテーブルにアクセス可能')
    }
  } catch (error) {
    console.log(`   ❌ 例外エラー: ${error.message}`)
    if (error.message.includes('Failed to fetch')) {
      console.log('   ⚠️  ネットワークエラー: Supabase URLが正しいか確認してください')
    }
  }
  
  // 接続テスト3: ヘルスチェック
  await testHealthCheck()
}

// 接続テスト3: ヘルスチェック
async function testHealthCheck() {
  console.log('')
  console.log('📡 テスト3: Supabase API ヘルスチェック...')
  
  try {
    // Supabase REST APIのヘルスチェックエンドポイント
    const healthUrl = `${supabaseUrl}/rest/v1/`
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    })
    
    if (response.ok) {
      console.log('   ✅ Supabase APIに接続可能')
      console.log(`   ステータス: ${response.status}`)
    } else {
      console.log(`   ⚠️  警告: ステータスコード ${response.status}`)
      const text = await response.text()
      console.log(`   レスポンス: ${text.substring(0, 200)}`)
    }
  } catch (error) {
    console.log(`   ❌ エラー: ${error.message}`)
    if (error.message.includes('Failed to fetch')) {
      console.log('   ⚠️  ネットワークエラー:')
      console.log('      - Supabase URLが正しいか確認')
      console.log('      - インターネット接続を確認')
      console.log('      - ファイアウォール設定を確認')
    }
  }
  
  // 最終結果の表示
  printSummary()
}

// 結果サマリーの表示
function printSummary() {
  console.log('')
  console.log('='.repeat(60))
  console.log('📊 テスト結果サマリー')
  console.log('='.repeat(60))
  console.log('')
  console.log('✅ 接続テストが完了しました')
  console.log('')
  console.log('📝 次のステップ:')
  console.log('1. エラーが表示された場合は、上記の解決方法を確認')
  console.log('2. すべてのテストが成功した場合、アプリケーションは正常に動作するはずです')
  console.log('3. ブラウザで http://localhost:3000 にアクセスして動作確認')
  console.log('')
}

