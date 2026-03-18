# Phase 1：Vercel にデプロイする手順（初めての人向け）

## いまから何をするか

**あなたのパソコンの中にある「グループセッションのアプリ」を、インターネット上に置きます。**

- 置く場所 ＝ **Vercel** というサービス（無料で使える）
- 置いたあと ＝ **1つのURL**（例: `https://〇〇〇.vercel.app`）がもらえる
- そのURLを誰かに送れば、**相手のパソコンやネットワークに左右されず**、同じアプリを開ける

---

## やることの流れ（3ステップ）

```
1. GitHub にコードを預ける（バックアップ＋Vercel が読むため）
2. Vercel の無料アカウントを作る
3. Vercel で「この GitHub のコードをデプロイして」と設定する
```

---

## ステップ 1：GitHub にコードを預ける

### 1-1. GitHub のアカウントがあるか確認

- まだなら [https://github.com](https://github.com) で「Sign up」から無料で作る
- すでにあるなら、ログインする

### 1-2. 新しい「リポジトリ」を 1 つ作る

1. GitHub にログインした状態で、右上の **＋** → **New repository** をクリック
2. **Repository name** に、英数字で名前を入れる（例: `group-session-feedback`）
3. **Public** のままにする
4. **「Add a README file」などにはチェックを入れない**（中身はあなたのパソコンから送るため）
5. **Create repository** をクリック

### 1-3. あなたのパソコンから、そのリポジトリに送る（push）

GitHub の「Create repository」が終わると、**Quick setup** の画面が出ます。  
そこに「…or push an existing repository from the command line」という欄があるので、その **2 行のコマンド** をコピーします。形はだいたい次のとおりです（URL はあなたのリポジトリ名で変わります）:

```bash
git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git
git push -u origin main
```

**あなたのパソコンでやること:**

1. **ターミナル** を開く（Cursor なら メニュー「ターミナル」→「新しいターミナル」）
2. 次のコマンドで、プロジェクトのフォルダに移動する:
   ```bash
   cd "/Users/yosuke/src/グループセッション"
   ```
3. さきほどコピーした **1 行目** を貼り付けて Enter（`git remote add origin ...`）
4. 続けて **2 行目** を貼り付けて Enter（`git push -u origin main`）
5. GitHub のユーザー名・パスワード（またはトークン）を聞かれたら入力する

**「Everything up-to-date」や「branch 'main' set up to track」などと出れば成功です。**  
GitHub のリポジトリのページを開くと、ファイル一覧が表示されているはずです。

---

## ステップ 2：Vercel のアカウントを作る

1. [https://vercel.com](https://vercel.com) を開く
2. **Sign Up** をクリック
3. **Continue with GitHub** を選ぶ（GitHub でログインすると、あとで「GitHub のリポジトリをデプロイ」がしやすい）
4. 表示に従って GitHub と連携し、Vercel のアカウントを作成する

---

## ステップ 3：Vercel で「このリポジトリをデプロイ」する

1. Vercel の画面で **Add New…** → **Project** をクリック
2. **Import Git Repository** で、さきほど push した **リポジトリ名**（例: group-session-feedback）を選ぶ
3. **Import** をクリック
4. 設定画面では、**そのまま Deploy** でよい（Framework は自動で Next.js と判定されます）
5. 数十秒〜1分ほど待つと **Congratulations** と表示され、**Visit** というボタンが出る
6. **Visit** をクリックすると、**あなたのアプリのURL**（例: `https://group-session-feedback.vercel.app`）が開く

**このURLが「みんなに共有する1本のリンク」です。**  
あなたも母さんも、このURLを開けば同じアプリが使えます。

---

## うまくいかないとき

| 症状 | 確認すること |
|------|------------------|
| `git push` でエラー | GitHub にログインできているか。リポジトリのURLを間違えていないか。 |
| Vercel でリポジトリが出てこない | Vercel と GitHub の連携ができているか。Vercel の「Account」→「Git Integrations」で GitHub が接続されているか確認。 |
| デプロイは成功したが、開くとエラー | 一度 Vercel のダッシュボードで **Redeploy** してみる。まだダメなら、エラー画面の文言をメモして誰かに聞く。 |

---

## ここまでできたら

- **Phase 1 は完了**です。
- 次は、そのURLをオンラインスクールの仲間に送って、1回セッションを試してみるとよいです。
- あとからコードを直したくなったら、パソコンで直してから `git add -A` → `git commit -m "〇〇を直した"` → `git push` すると、Vercel が自動で再デプロイします。
