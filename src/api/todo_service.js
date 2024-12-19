import { Todo } from "../models/todo.js";
import { Message } from "../component/message.js";
import { ApiUrls } from "./config.js";

// API 通信を管理するクラス
export class TodoService {
    /**
    * API 通信を行う関数。
    */
    static async fetchFromApi(url, options = {}) {
        // 新しいリクエスト前に既存のメッセージを削除
        Message.dispose();

        return fetch(url, options)
            .then((res) => {
                if (!res.ok) {
                    // ステータスコードが 200 系以外の場合はエラーをスロー
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                // レスポンスを JSON として返却
                return res.json();
            })
            .catch((error) => {
                console.error("API error:", error);
                // エラーを呼び出し元に伝播
                throw error;
            });
    }

    /**
    * GetTodo を呼び出す関数。
    */
    static async getAll() {
        return this.fetchFromApi(ApiUrls.getTodo)
            .then((data) =>
                // サーバーから取得したデータを Todo クラスのインスタンスに変換
                data.map(
                    (item) =>
                        new Todo(
                            item.id,
                            item.title,
                            item.detail,
                            item.deadLine,
                            item.is_done,
                            item.is_deleted
                        )
                )
            )
            .catch((error) => {
                console.error("Error fetching todos:", error);
                // エラー時は空配列を返却
                return [];
            });
    }

    /**
    * ManageTodo を呼び出す関数
    */
    static async update(formData) {
        // サーバーに送信するデータの作成
        const data = {
            post_type: formData.post_type,
            id: formData.id,
            title: formData.title,
            detail: formData.detail,
            deadLine: formData.deadLine,
            is_done: formData.is_done,
            is_deleted: formData.is_deleted,
        };

        return (
            this.fetchFromApi(ApiUrls.manageTodo, {
                method: "POST", // POST メソッドで送信
                headers: { "Content-Type": "application/json" }, // JSON 形式のデータを指定
                body: JSON.stringify(data), // データを JSON 文字列に変換して送信
            })
                /* 返却される JSON データ例：
                * {message: 'Todo is_deleted updated successfully!'}
                */
                .then(() => true) // 成功時は true を返却
                .catch((error) => {
                    console.error("Error updating todo:", error);
                    // エラー時は false を返却
                    return false;
                })
        );
    }
}