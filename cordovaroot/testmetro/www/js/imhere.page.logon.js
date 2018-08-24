imhere.LogonPage = (function() {
	var onLogonClick = (function (event){
		$('#logon-main-logon-a').addClass('ui-disabled');
		$.mobile.loading( "show", {
			text: "Now loading...",
			textVisible: true,
			theme: "c",
			html: ""
		});
		var undefined;
		imhereglobalcontext.twitterAPI.getRequestToken().then(
			function() {
				imhereglobalcontext.twitterAPI.userAuthentication().then(
					function(oauthtoken, verifier){
						// Cancelではない場合
						if (verifier !== undefined) {
							imhereglobalcontext.twitterAPI.getAccessToken(oauthtoken, verifier).then(
								function(at, ats){
									var dbapi = new imhere.IndexedDbAPI();
									dbapi.openDB().then(
										function() {
											dbapi.addToken("twitter", {at:at, ats:ats}).then(
												function() {
													window.location.href="#main_page";
												}
											);
										}
									);
								}
							);
						} else {
							// Cancelの場合は画面を再びオペレーション出来るように初期状態に戻す
							$.mobile.loading("hide");
							$('#logon-main-logon-a').removeClass('ui-disabled');
						}						
					}
				);
			}
		);
	});
    return {
        initModule: function() {
			// 画面作成


			// Event attach
			$('#logon-main-logon-a').click(onLogonClick);

			return true;
        }
    }
})();