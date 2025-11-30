/**
 * KumbiaPHP web & app Framework
 *
 * LICENSE
 *
 * このソースファイルは、同梱されている LICENSE ファイルに記載された
 * New BSD ライセンスの条件に従います。
 *
 * jQuery 用プラグイン
 * （ヘルパー向けの基本的なコールバック群を提供）
 *
 * @copyright  Copyright (c) 2005 - 2023 KumbiaPHP Team (http://www.kumbiaphp.com)
 * @license    https://github.com/KumbiaPHP/KumbiaPHP/blob/master/LICENSE   New BSD License
 */

(function ($) {
	/**
	 * Kumbia オブジェクト
	 *
	 */
	$.Kumbia = {
		/**
		 * サーバ上の public ディレクトリへのパス
		 *
		 * @var String
		 */
		publicPath: null,

		/**
		 * 読み込まれたプラグイン
		 *
		 * @var Array
		 */
		plugin: [],

		/**
		 * 確認ダイアログを表示する
		 *
		 * @param Object event
		 */
		cConfirm: function (event) {
			let el = $(this);
			if (!confirm(el.data("msg"))) {
				event.preventDefault();
			}
		},

		/**
		 * 要素にエフェクトを適用する
		 *
		 * @param String fx エフェクト名
		 */
		cFx: function (fx) {
			return function (event) {
				event.preventDefault();
				let el = $(this),
					rel = $("#" + el.data("to"));
				rel[fx]();
			};
		},

		/**
		 * AJAX でコンテンツを読み込む
		 *
		 * @param Object event
		 */
		cRemote: function (event) {
			let el = $(this),
				rel = $("#" + el.data("to"));
			event.preventDefault();
			rel.hide();
			rel.load(this.href);
			rel.show('fast');
		},

		/**
		 * 確認付きで AJAX 読み込みを行う
		 *
		 * @param Object event
		 */
		cRemoteConfirm: function (event) {
			let el = $(this),
				rel = $("#" + el.data("to"));
			event.preventDefault();
			if (confirm(el.data("msg"))) {
				rel.hide();
				rel.load(this.href);
				rel.show('fast');
			}
		},

		/**
		 * フォームを非同期（POST）で送信し、
		 * 結果を指定コンテナに表示する
		 */
		cFRemote: function (event) {
			event.preventDefault();
			let el = $(this);
			let button = $("[type=submit]", el);
			button.attr("disabled", "disabled");
			let url = el.attr("action");
			let div = el.attr("data-to");
			$.post(url, el.serialize(), function (data, status) {
				let capa = $("#" + div);
				capa.hide();
				capa.html(data);
				capa.show("fast");
				button.attr("disabled", null);
			});
		},

		/**
		 * select 変更時に AJAX でリストを更新する
		 *
		 * @param Object event
		 */
		cUpdaterSelect: function (event) {
			let $t = $(this),
				$u = $("#" + $t.data("update")),
			    url = $t.data("url");
			$u.empty();
			$.get(
				url,
				{ id: $t.val() },
				function (d) {
					for (let i in d) {
						let a = $("<option />").text(d[i]).val(i);
						$u.append(a);
					}
				},
				"json"
			);
		},

		/**
		 * デフォルトメソッドにイベントをバインドする
		 *
		 */
		bind: function () {
			// 確認ダイアログ付きリンク・ボタン
			$("body").on("click", "a.js-confirm, input.js-confirm", this.cConfirm);

			// AJAX リンク
			$("body").on("click", "a.js-remote", this.cRemote);

			// 確認付き AJAX リンク
			$("body").on("click", "a.js-remote-confirm", this.cRemoteConfirm);

			// show エフェクト
			$("body").on("click", ".js-show", this.cFx("show"));

			// hide エフェクト
			$("body").on("click", ".js-hide", this.cFx("hide"));

			// toggle エフェクト
			$("body").on("click", ".js-toggle", this.cFx("toggle"));

			// fadeIn エフェクト（非推奨: CSS を推奨）
			$("body").on("click", ".js-fade-in", this.cFx("fadeIn"));

			// fadeOut エフェクト（非推奨: CSS を推奨）
			$("body").on("click", ".js-fade-out", this.cFx("fadeOut"));

			// AJAX フォーム
			$("body").on("submit", "form.js-remote", this.cFRemote);

			// AJAX で更新されるセレクトボックス
			$("body").on("change", "select.js-remote", this.cUpdaterSelect);

			// DatePicker をバインド
			$.Kumbia.bindDatePicker();
		},

		/**
		 * プラグインのオートロードを行う
		 * jp- クラス名の命名規則に従って自動的に読み込む
		 */
		autoload: function () {
			let elem = $("[class*='jp-']");
			$.each(elem, function (i) {
				let el = $(this); // jp-* クラスを持つ要素
				let classes = el.attr("class").split(" ");
				for (i in classes) {
					if (classes[i].substr(0, 3) == "jp-") {
						if ($.inArray(classes[i].substr(3), $.Kumbia.plugin) != -1)
							continue;
						$.Kumbia.plugin.push(classes[i].substr(3));
					}
				}
			});
			let head = $("head");
			for (let i in $.Kumbia.plugin) {
				$.ajaxSetup({ cache: true });
				head.append(
					'<link href="' +
					$.Kumbia.publicPath +
					"css/" +
					$.Kumbia.plugin[i] +
					'.css" type="text/css" rel="stylesheet"/>'
				);
				$.getScript(
					$.Kumbia.publicPath +
					"javascript/jquery/jquery." +
					$.Kumbia.plugin[i] +
					".js",
					function (data, text) { }
				);
			}
		},

		/**
		 * 必要に応じて Unobtrusive DatePicker を読み込み・バインドする
		 *
		 */
		bindDatePicker: function () {
			// 対象となる input 要素を取得
			let inputs = $("input.js-datepicker");
			/**
			 * DatePicker を各 input にバインドする関数
			 *
			 */
			let bindInputs = function () {
				inputs.each(function () {
					let opts = { monthSelector: true, yearSelector: true };
					let input = $(this);
					// 最小日付が指定されているかチェック
					if (input.attr("min") != undefined) {
						opts.dateMin = input.attr("min").split("-");
					}
					// 最大日付が指定されているかチェック
					if (input.attr("max") != undefined) {
						opts.dateMax = input.attr("max").split("-");
					}

					// カレンダーを作成
					input.pickadate(opts);
				});
			};

			// すでに Unobtrusive DatePicker が読み込まれている場合は即時バインド
			if (typeof $.pickadate != undefined) {
				return bindInputs();
			}

			// スタイルシートを読み込む
			$("head").append(
				'<link href="' +
				this.publicPath +
				'css/pickadate.css" rel="stylesheet">'
			);

			// Unobtrusive DatePicker を読み込み（キャッシュ利用可）
			jQuery
				.ajax({
					dataType: 'script',
					cache: true,
					url: this.publicPath + 'javascript/jquery/pickadate.js',
				})
				.done(function () {
					bindInputs();
				});
		},

		/**
		 * プラグインを初期化する
		 *
		 */
		initialize: function () {
			// publicPath を取得
			let src = document.currentScript.src;
			this.publicPath = src.slice(0, src.lastIndexOf('javascript/'));

			// デフォルトメソッドをバインドし、プラグインを自動ロード
			$(function () {
				$.Kumbia.bind();
				$.Kumbia.autoload();
			});
		},
	};

	// プラグインを初期化
	$.Kumbia.initialize();
})(jQuery);
