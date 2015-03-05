var db = openDatabase('dbFrasi', '1.0', 'db', 50000), User = UrlAppStore = SearchText = "", LocalFrasi = new Array();
var len = navigator.language.substr(0, 2), IsReadyFrasi = IsReadyInglese = AppIsRunning = isLoadingRandomArray = isShowingRandom = false;
var lingua = (Testi[len] != null ? len : "en"), isPhone = Ext.os.deviceType == 'Phone';
var randomPanel, VisInglese = Visite = true, randomArray = new Array(), ArchivioToolbar;
var Parametri = {
	'Lingua'			: lingua,
	'LinguaXJson'		: len,
	'Page'				: 25,
	'UrlArchivio'		: 'http://politicinelcesso.it/chuckNorris/frasi.php',
	'UrlClassifica'		: 'http://politicinelcesso.it/chuckNorris/classificaFrasi.php',
	'UrlAggiornaVoti'	: 'http://politicinelcesso.it/chuckNorris/aggiornaPunteggiFrasi.php',
	'UrlRandom'			: 'http://politicinelcesso.it/chuckNorris/randomFrasi.php',
	'UrlInserisci'		: 'http://politicinelcesso.it/chuckNorris/inserisci.php',
	'UrlAppStore'		: 'http://politicinelcesso.it/chuckNorris/urlAppStore.php',
	'NumberOfRandom'	: isPhone ? 2 : 4,
	'ui'				: 'dark',
	'uiOverlay'			: 'light'
};
var LABEL = Testi[Parametri['Lingua']];

//alert(navigator.language);

function replaceAll(txt, replace, with_this) {
	return txt.replace(new RegExp(replace, 'g'),with_this);
}
function showRandomPhraseIntoPanel(panel) {
	if (!isLoadingRandomArray) {
		isLoadingRandomArray = true;
		Ext.data.JsonP.request({
			callbackKey: 'fun',
			url: Parametri['UrlRandom'],
			params: {
				len: Parametri['LinguaXJson'],
				len2: (VisInglese ? "en" : '')
			},
			success: function(result, request) {
				randomArray = new Array();
				for (var i = 0; i < result.length; i++)
					randomArray.push(result[i]);
				var html = '<table style="width: 100%">';
				for (var i = 0; i < Parametri['NumberOfRandom']; i++) {
					if (randomArray.length > 0) {
						var phrase = randomArray.pop();
						html +=  '<tr class="rigaRandom"> \
							<td class="fraseRandom" id="frase-' + phrase['ID'] + '"><center> \
								<p>' + phrase['frase'] + '</p> \
								<div class="infoFrase">by ' + phrase['autore'] + ' - <b>' + phrase['voti'] + ' ' + LABEL['votes'] + '</b></div> \
							</center></td> \
							<td class="stellaFraseRandom"><img id="star-' + phrase['ID'] + '" onTouchStart="togglePref(' + phrase['ID'] + ', \'' + addSlashes(phrase['frase']) + '\', \'' + addSlashes(phrase['autore']) + '\', \'' + phrase['data'] + '\', this)" onClick="togglePref(' + phrase['ID'] + ', \'' + addSlashes(phrase['frase']) + '\', \'' + addSlashes(phrase['autore']) + '\', \'' + phrase['data'] + '\', this)" src="resources/images/' + echoStella(phrase['ID'])  + '.png"></td> \
							</tr>';
					} else
						break;
				}
				html += '</table>';
				panel.setHtml(html);
				isLoadingRandomArray = false;
				randomPanel.setMasked(false);
			},
			failure: function() {
				isLoadingRandomArray = false;
				randomPanel.setMasked(false);
			}
		});
	}
}

function SetLocalUser(nick) {
	if (nick != "" && nick != null) {
		db.transaction(function (tx) {
			tx.executeSql('DELETE FROM user',[], function(tx,result){} ,function(tx,result){});
			tx.executeSql('INSERT INTO user (name) VALUES ("' + nick + '")',[],function(tx,result){},function(tx,result){});
		});
	}
}
function InitUser (tx, results) {
	if (results.rows.length > 0) {
		var row = results.rows.item(0);
		User = row['name'];
	}
}
function InitFrasi (tx, results) {
	LocalFrasi.splice(0, LocalFrasi.length);
	for (var i = 0; i < results.rows.length; i++) {
		var row = results.rows.item(i);
		var frase = {"ID":row['ID'], "frase":row['frase'], "autore":row['autore'], "data":row['data'] };
		LocalFrasi.push(frase);
	}
	IsReadyFrasi = true;
	CheckAPP();
	if (Visite)
		db.transaction(function (tx) {
			tx.executeSql('SELECT * FROM visite',[], InitVisite ,function(tx,result){});
		});
}
function InitInglese (tx, results) {
	if (results.rows.length > 0) {
		var row = results.rows.item(0);
		VisInglese = (row['visualizza'] == 1 ? true : false);
	} else {
		VisInglese = true;
		db.transaction(function (tx) {
			tx.executeSql('INSERT INTO inglese (visualizza) VALUES (1)',[], function(tx, result){} ,function(tx,result){});
		});
	}
	IsReadyInglese = true;
	CheckAPP();
}
function InitVisite (tx, results) {
	if (navigator.onLine) 
		if (results.rows.length > 0) {
			var row = results.rows.item(0);
			var cont = row['cont'];
			cont = (cont) + 1;
			db.transaction(function (tx) {
				tx.executeSql('DELETE FROM visite', [], null, null)
				tx.executeSql('INSERT INTO visite (cont) VALUES ("' + cont + '")',[],function(tx,result){},function(tx,result){});
			});
			if ((cont == 5 || (cont % 6 == 0 && cont > 10)) && cont < 500) {
				Ext.data.JsonP.request({
					url: Parametri['UrlAppStore'],
					callbackKey: 'fun',
					success: function(result, request) {
						if (result != "") {
							UrlAppStore = result;
							var AppStorePanel =  Ext.create('Ext.Panel', {
								hideOnMaskTap: false,
								showAnimation: true,
								hideAnimation: true,
								modal: true,
								padding: 0,
								scrollable: true,
								width: isPhone ? '90%' : '40%',
								height: isPhone ? '60%' : '30%',
								style: "font-size: 16px;",
								html: "<div style=\"width:100%; height:100%; padding:5px;\"><br><center>" + LABEL['rateText'] + "<br><br></center></div>",
								items: [{
									xtype: 'toolbar',
									docked: 'top',
									title: LABEL['rateTitle'],
									ui: Parametri['uiOverlay']
								}, {
									xtype: 'toolbar',
									docked: 'bottom',
									ui: Parametri['uiOverlay'],
									style: "font-size: 19px; ",
									items: [{
										xtype: "button",
										text: LABEL['appStore'],
										ui: 'confirm',
										listeners: {
											tap: function(el, e, opt) {
												if (navigator.onLine) {
													Visite = false;
													AppStorePanel.hide();
													db.transaction(function (tx) {
														tx.executeSql('DELETE FROM visite', [], null, null)
														tx.executeSql('INSERT INTO visite (cont) VALUES ("900")',[],function(tx,result){},function(tx,result){});
													});
													window.open(UrlAppStore);
												} else
													Ext.Msg.alert(LABEL['error'], LABEL['connectionError']);
											}
										}
									}, {
										xtype: 'spacer'
									}, {
										xtype: 'button',
										text: LABEL['notNow'],
										listeners: {
											tap: function() {
												Visite = false;
												AppStorePanel.hide();
											}
										}
									}, {
										xtype: 'button',
										text: LABEL['never'],
										listeners: {
											tap: function() {
												db.transaction(function (tx) {
													tx.executeSql('DELETE FROM visite', [], null, null)
													tx.executeSql('INSERT INTO visite (cont) VALUES ("1000")',[],function(tx,result){},function(tx,result){});
												});
												AppStorePanel.hide();
												Visite = false;
											}
										}
									}]
								}]
							});
							var task = new Ext.util.DelayedTask(function(){
								AppStorePanel.showBy(ArchivioToolbar);
							});
							task.delay(500);
						}
					}
				});
			}
		} else {
			db.transaction(function (tx) {
				tx.executeSql('DELETE FROM visite', [], null, null)
				tx.executeSql('INSERT INTO visite (cont) VALUES ("1")',[],function(tx,result){},function(tx,result){});
			});
		}
} 
function InitDb() {
	db.transaction(function (tx) {
		//FRASI
		//tx.executeSql('DROP TABLE IF EXISTS frasi',[],function(tx,result){},function(tx,result){});
		tx.executeSql('CREATE TABLE IF NOT EXISTS frasi (ID INTEGER PRIMARY KEY, frase TEXT, autore TEXT, data TEXT)',[],function(tx,result){},function(tx,result){});
		tx.executeSql('SELECT * FROM frasi',[], InitFrasi ,function(tx,result){});
		
		//INGLESE
		//tx.executeSql('DROP TABLE IF EXISTS inglese',[],function(tx,result){},function(tx,result){});
		tx.executeSql('CREATE TABLE IF NOT EXISTS inglese (visualizza INTEGER)',[],function(tx,result){},function(tx,result){});
		if (Parametri['LinguaXJson'] != "en")
			tx.executeSql('SELECT * FROM inglese',[], InitInglese ,function(tx,result){});
		else {
			VisInglese = false;
			IsReadyInglese = true;
			CheckAPP();
		}
		
		//VISITE
		//tx.executeSql('DROP TABLE IF EXISTS visite',[],function(tx,result){},function(tx,result){});
		tx.executeSql('CREATE TABLE IF NOT EXISTS visite (cont INTEGER)',[],function(tx,result){},function(tx,result){});
		
		//USER
		//tx.executeSql('DROP TABLE IF EXISTS user',[],function(tx,result){},function(tx,result){});
		tx.executeSql('CREATE TABLE IF NOT EXISTS user (name TEXT)',[],function(tx,result){},function(tx,result){});
		tx.executeSql('SELECT * FROM user',[], InitUser ,function(tx,result){});
	});
}
InitDb();

function togglePref(ID, frase, autore, data, el) {
	frase = replaceAll(frase, '{quot}', '\"');
	autore = replaceAll(autore, '{quot}', '\"');
	db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM frasi WHERE ID = ' + ID, [], function(tx,result) {
			if (result.rows.length > 0) {
				tx.executeSql('DELETE FROM frasi WHERE ID = ' + ID , [], function(tx,result) {
					el.src = "resources/images/stella_off.png";
					Ext.data.JsonP.request({
						callbackKey: 'fun',
						url: Parametri['UrlAggiornaVoti'],
						params: {
							action: "sub",
							id:	ID
						}
					});
				}, function(tx,result) { DatabaseError(); });
			} else {
				tx.executeSql('INSERT INTO frasi (ID, frase, autore, data) VALUES (' + ID + ', "' + frase + '", "' + autore + '", "' + data + '") ', [], function(tx,result) {
					el.src = "resources/images/stella_on.png";
					Ext.data.JsonP.request({
						callbackKey: 'fun',
						url: Parametri['UrlAggiornaVoti'],
						params: {
							action: "add",
							id:	ID
						}
					});
				}, function(tx,result) { DatabaseError(); });
			}
			tx.executeSql('SELECT * FROM frasi',[], InitFrasi ,function(tx,result){});
		}, function(tx,result) { DatabaseError(); });
	});
}

function DatabaseError() {
	Ext.Msg.alert(LABEL['error'], LABEL['databaseError']);
}

//<debug>
Ext.Loader.setPath({
    'Ext': 'src'
});
//</debug>

var timeAgoInWords = function(date) {
	date = new Date(date.replace("-","/").replace("-","/"));
    try {
        var now = Math.ceil(Number(new Date()) / 1000),
            dateTime = Math.ceil(Number(date) / 1000),
            diff = now - dateTime,
            str;
        if (diff < 60) {
            return String(diff) + ' seconds ago';
        } else if (diff < 3600) {
            str = String(Math.ceil(diff / (60)));
            return str + (str == "1" ? ' minute' : ' minutes') + ' ago';
        } else if (diff < 86400) {
            str = String(Math.ceil(diff / (3600)));
            return str + (str == "1" ? ' hour' : ' hours') + ' ago';
        } else if (diff < 60 * 60 * 24 * 365) {
            str = String(Math.ceil(diff / (60 * 60 * 24)));
            return str + (str == "1" ? ' day' : ' days') + ' ago';
        } else {
			return Ext.Date.format(date, LABEL['dateFormat']);
        }
    } catch (e) {
        return date;
    }
}
var echoStella = function (ID) {
	var ris = "stella_off";
	for (var i = 0; i < LocalFrasi.length; i++) {
		var frase = LocalFrasi[i];
		if (frase['ID'] == ID) {
			ris = "stella_on";
			break;
		}
	}
	return ris;
}
function addSlashes (str) {
	str = replaceAll(str, "'","\\'");
	str = replaceAll(str, "&#039;","\\'");
	str = replaceAll(str, '&quot;','{quot}');
	str = replaceAll(str, '&amp;&quot;','{quot}');
	return str;
}

function CheckAPP() {
	if (IsReadyFrasi && IsReadyInglese && !AppIsRunning) {
		AppIsRunning = true;
		APP();
	}
}
CheckAPP();
function APP() {
Ext.application({
    glossOnIcon: false,
    icon: {
        57: 'resources/icons/icon.png',
        72: 'resources/icons/icon@72.png',
        114: 'resources/icons/icon@2x.png',
        144: 'resources/icons/icon@114.png'
    },

    phoneStartupScreen: 'resources/loading/Homescreen.jpg',
    tabletStartupScreen: 'resources/loading/Homescreen~ipad.jpg',

    requires: [
        'Ext.tab.Panel',
		'Ext.Panel',
		'Ext.data.Store',
        'Ext.List',
		'Ext.Toolbar',
		'Ext.field.Search',
		'Ext.Button',
		'Ext.form.*',
        'Ext.field.*'
    ],
	name: 'ChuckNorris',
    launch: function() {
		Ext.define('FrasiStore', {
            extend: 'Ext.data.Store',
            config: {
                fields: ['ID', 'frase', 'autore', 'voti', 'data', 'lingua'],
                pageSize: Parametri['Page'],
                autoLoad: true,
                proxy: {
                    type: 'jsonp',
                    url: Parametri['UrlArchivio'],
                    pageParam: 'p',
                    startParam: 's',
                    limitParam: 'l',
                    callbackKey : 'fun',
                    extraParams: {
						len: Parametri['LinguaXJson'],
						len2: (VisInglese ? "en" : '')
                    },
                    reader: {
                        type: 'json',
                        rootProperty: 'results'
                    }
                }
            },
			listeners: {
				load: function() {
					ChuckList.setMasked(false);
				}
			}
        });
		var FrasiStore = Ext.create('FrasiStore');
		Ext.define('SearchStore', {
			extend: 'Ext.data.Store',
			config: {
				fields: ['ID', 'frase', 'autore', 'voti', 'data', 'lingua'],
				pageSize: Parametri['Page'],
				autoLoad: true,
				proxy: {
					type: 'jsonp',
					url: Parametri['UrlArchivio'],
					pageParam: 'p',
					startParam: 's',
					limitParam: 'l',
					callbackKey : 'fun',
					extraParams: {
						q: SearchText,
						len: Parametri['LinguaXJson'],
						len2: (VisInglese ? "en" : '')
					},
					reader: {
						type: 'json',
						rootProperty: 'results'
					}
				}
			},
			listeners: {
				load: function() {
					ChuckList.setMasked(false);
				}
			}
		});
		var SearchStore = Ext.create('SearchStore');
		var SearchField = Ext.create('Ext.field.Search', {
			name: 'search',
			placeHolder: 'Search',
			value: SearchText,
			listeners: {
				action: function(field, e, opt) {
					ChuckList.setMasked({
						xtype: 'loadmask',
						message: LABEL['loading...']
					});
					SearchText = field.getValue();
					SearchStore.removeAll(false);
					if (SearchText != "") {
						SearchStore.getProxy().setExtraParam("q", SearchText);
						SearchStore.load();
					}
				},
				clearicontap: function(field, e, opt) {
					SearchStore.removeAll(false);
					SearchField.focus();
				}
			}
		});
		var SearchBar = Ext.create('Ext.Toolbar',  {
			xtype: 'toolbar',
			docked: 'top',
			ui: Parametri['ui'],
			hidden: true,
			items: [
				Ext.create('Ext.Button', {
					iconCls: 'delete',
					iconMask: true,
					ui: 'round decline',
					listeners: {
						tap: function() {
							SearchBar.setHidden(true);
							ArchivioToolbar.setHidden(false);
							ChuckList.setScrollToTopOnRefresh(true);
							ChuckList.setStore(FrasiStore);
							FrasiStore.load();
							ChuckList.refresh();
						}
					}
				}),
				{ xtype: 'spacer' },
				SearchField,
				{ xtype: 'spacer' }
			]
		});
		ArchivioToolbar = Ext.create('Ext.Toolbar', {
			xtype: 'toolbar',
			docked: 'top',
			title: LABEL['nomeApp'],
			style: "font-size: 17px; height: " + (isPhone ? "47" : "43") + "px",
			ui: Parametri['ui'],
			centered: true,
			items: [{
				xtype: 'button',
				iconCls: 'search',
				iconMask: true,
				ui: 'normal',
				docked: 'left',
				style: 'margin: 5px',
				listeners: {
					tap: function() {
						ArchivioToolbar.setHidden(true);
						SearchBar.setHidden(false);
						ChuckList.setStore(SearchStore);
						SearchStore.load();
						ChuckList.refresh();
						if (SearchText == "")
							SearchField.focus();
					}
				}
			}, {
				xtype: 'button',
				iconCls: 'refresh',
				iconMask: true,
				ui: 'normal',
				docked: 'right',
				style: 'margin: 5px',
				listeners: {
					tap: function() {
						ChuckList.setScrollToTopOnRefresh(true);
						if (navigator.onLine) {
							ChuckList.setMasked({
								xtype: 'loadmask',
								message: LABEL['loading...']
							});
							FrasiStore.loadPage(1, {});
						}
					}
				}
			}]
		});
        var ChuckList = Ext.create('Ext.List', {
			title: LABEL['page1'],
			iconCls: 'bookmarks',
			cls: 'card1 card',
			badgeText: '',
			store: FrasiStore,
			limit: Parametri['Page'],
			disableSelection: true,
			scrollToTopOnRefresh: false,
			plugins: [{ 
				xclass: 'Ext.plugin.ListPaging',
				autoPaging: true,
				loadMoreText: LABEL['loadMoreText']
			}/*, {
				xclass: 'Ext.plugin.PullRefresh'
			}*/],
			emptyText: '<p class="no-results">' + LABEL['noResults'] + '</p>',
			itemTpl: Ext.create('Ext.XTemplate',
				'<div class="frase prefEl" id="frase-{ID}">',
				'<p>{frase}</p>',
				'<div class="infoFrase">by <b>{autore}</b> - {[this.posted(values.data)]}</div>',
				'</div>',
				'<div class="stellaFrase"><img id="star-{ID}" onTouchStart="togglePref({ID}, \'{[this.text(values.frase)]}\', \'{[this.text(values.autore)]}\', \'{data}\', this)" onClick="togglePref({ID}, \'{[this.text(values.frase)]}\', \'{[this.text(values.autore)]}\', \'{data}\', this)" src="resources/images/{[this.stella(values.ID)]}.png"></div>',
				{ posted: timeAgoInWords },
				{ stella: echoStella },
				{ text: addSlashes}
			),
			listeners: {
				painted: function() {
					ChuckList.setScrollToTopOnRefresh(false);
					ChuckList.refresh();
					//alert("lista");
				}
			},
			items: [ArchivioToolbar, SearchBar]
		});
		
		
		
		Ext.define('PrefStore', {
            extend: 'Ext.data.Store',
            config: {
				fields: ['ID', 'frase', 'autore', 'data', 'voti'],
                autoLoad: true,
				sorters: [{property : 'data', direction: 'DESC'}],
				data: LocalFrasi,
				proxy: {
					type: 'memory',
					reader: {
						type: 'json'
					}
				}
            }
        });
		var PrefStore = Ext.create('PrefStore');
		var Preferite = Ext.create('Ext.List',{
			title: LABEL['page3'],
			iconCls: 'favorites',
			cls: 'card3 card',
			badgeText: '',
			disableSelection: true,
			scrollToTopOnRefresh: false,
			emptyText: '<p class="no-results">' + LABEL['noFavorites'] + '</p>',
			store: PrefStore,
			itemTpl: Ext.create('Ext.XTemplate',
				'<div class="frase prefEl" id="frase-{ID}">',
				'<p>{frase}</p>',
				'<div class="infoFrase">by <b>{autore}</b></div>',
				'</div>',
				'<div class="stellaFrase"><img id="star-{ID}" onTouchStart="togglePref({ID}, \'{[this.text(values.frase)]}\', \'{[this.text(values.autore)]}\', \'{data}\', this)" onClick="togglePref({ID}, \'{[this.text(values.frase)]}\', \'{[this.text(values.autore)]}\', \'{data}\', this)" src="resources/images/{[this.stella(values.ID)]}.png"></div>',
				{ posted: timeAgoInWords },
				{ stella: echoStella },
				{ text: addSlashes }
			),
			items: [{
				xtype: 'toolbar',
				docked: 'top',
				title: LABEL['page3'],
				ui: Parametri['ui']
			}],
			listeners: {
				painted: function() {
					PrefStore.load();
				}
			}
		});
		
		
		
		Ext.define('ClassStore', {
            extend: 'Ext.data.Store',
            config: {
                fields: ['ID', 'frase', 'autore', 'voti', 'data', 'lingua'],
                pageSize: Parametri['Page'],
                autoLoad: true,
                proxy: {
                    type: 'jsonp',
                    url: Parametri['UrlClassifica'],
                    pageParam: 'p',
                    startParam: 's',
                    limitParam: 'l',
                    callbackKey : 'fun',
                    extraParams: {
						len: Parametri['LinguaXJson'],
						len2: (VisInglese ? "en" : '')
                    },
                    reader: {
                        type: 'json',
                        rootProperty: 'results'
                    }
                }
            },
			listeners: {
				load: function() {
					Migliori.setMasked(false);
				}
			}
        });
		var ClassStore = Ext.create('ClassStore');
        var Migliori = Ext.create('Ext.List', {
			title: LABEL['page2'],
			iconCls: 'team',
			cls: 'card2 card',
			store: ClassStore,
			limit: Parametri['Page'],
			disableSelection: true,
			scrollToTopOnRefresh: false,
			plugins: [{ 
				xclass: 'Ext.plugin.ListPaging',
				autoPaging: true,
				loadMoreText: LABEL['loadMoreText']
			}],
			emptyText: '<p class="no-results">' + LABEL['noResults'] + '</p>',
			itemTpl: Ext.create('Ext.XTemplate',
				'<div class="frase prefEl" id="frase-{ID}">',
				'<p>{frase}</p>',
				'<div class="infoFrase">by {autore} - <b>{voti} ' + LABEL['votes'] + '</b></div>',
				'</div>',
				'<div class="stellaFrase"><img id="star-{ID}" onTouchStart="togglePref({ID}, \'{[this.text(values.frase)]}\', \'{[this.text(values.autore)]}\', \'{data}\', this)" onCLick="togglePref({ID}, \'{[this.text(values.frase)]}\', \'{[this.text(values.autore)]}\', \'{data}\', this)" src="resources/images/{[this.stella(values.ID)]}.png"></div>',
				{ stella: echoStella },
				{ text: addSlashes }
			),
			items: [{
				xtype: 'toolbar',
				docked: 'top',
				title: LABEL['page2'],
				ui: Parametri['ui'],
				items: [{
					xtype: 'button',
					iconCls: 'refresh',
					iconMask: true,
					ui: 'normal',
					docked: 'right',
					style: 'margin: 5px',
					listeners: {
						tap: function() {
							if (navigator.onLine) {
								Migliori.setMasked({
									xtype: 'loadmask',
									message: LABEL['loading...']
								});
								Migliori.setScrollToTopOnRefresh(true);
								ClassStore.loadPage(1, {});
							}
						}
					}
				}, {
					xtype: 'button',
					iconCls: 'organize',
					iconMask: true,
					ui: 'normal',
					docked: 'left',
					style: 'margin: 5px',
					listeners: {
						tap: function(el, e, opt) {
							showRandom(el);
						}
					}
				}]
			}],
			listeners: {
				painted: function() {
					if (navigator.onLine) {
						Migliori.setScrollToTopOnRefresh(false);
						ClassStore.load();
					}
				}
			}
		});
		
		function showRandom(button) {
			randomPanel =  Ext.create('Ext.Panel', {
				left: 0,
				hideOnMaskTap: false,
				showAnimation: true,
				hideAnimation: true,
				modal: true,
				padding: 0,
				scrollable: true,
				width: isPhone ? '95%' : '80%',
				height: isPhone ? '70%' : 350,
				items: [{
					xtype: 'toolbar',
					docked: 'top',
                    title: Parametri['NumberOfRandom'] + LABEL['randomTitle'],
					ui: Parametri['uiOverlay']
				}, {
					xtype: 'toolbar',
					docked: 'bottom',
					ui: Parametri['uiOverlay'],
					items: [{
						text: LABEL['another'],
						ui: 'confirm',
						listeners: {
							tap: function(el, e, opt) {
								randomPanel.setMasked({
									xtype: 'mask'
								});
								showRandomPhraseIntoPanel(randomPanel);
							}
						}
					}, {
						xtype: 'spacer'
					}, {
						xtype: 'button',
						text: LABEL['close'],
						ui: 'decline',
						listeners: {
							tap: function() {
								randomPanel.hide();
							}
						}
					}]
				}]

			});
			showRandomPhraseIntoPanel(randomPanel);
			randomPanel.showBy(button, "tl-bl");
		}
		
		var Submit = function() {
			SetLocalUser(Inserisci.getValues(true).nick);
			if (navigator.onLine) {
				Inserisci.setMasked({
					xtype: 'loadmask',
					message: LABEL['saving...']
				});
				Inserisci.submit({
					url: Parametri['UrlInserisci'],
					method: 'POST',
					success: function(el, ris) {
						Inserisci.setMasked(false);
						Inserisci.setValues({ frase: "" });
						FrasiStore.load();
						Ext.Msg.show({
							title: LABEL['phraseInsertedTitle'],
							message: LABEL['phraseInsertedMess'],
							buttons: Ext.MessageBox.OK
						});
					},
					failure: function(el, ris) {
						Inserisci.setMasked(false);
						Ext.Msg.show({
							title: LABEL['insertFailedTitle'],
							message: LABEL['insertError' + (ris.error ? ris.error : "")],
							buttons: Ext.MessageBox.OK
						});
					}
				});
			} else
				Ext.Msg.show({
					title: LABEL['connectionError'],
					message: LABEL['retriesInsert'],
					buttons: Ext.MessageBox.OK
				});
		}
		if (isPhone) {
			var items = [{
				xtype: 'toolbar',
				docked: 'top',
				title: LABEL['page4'],
				ui: Parametri['ui']
			}, {
				xtype: 'fieldset',
                title: LABEL['yourNickname'],
				style: 'margin-top: -25px; ',
                defaults: {
                    required: true,
                    labelWidth: '0%'
                },
                items: [{
					xtype: 'textfield',
					name: 'nick'
				}]
			}, {
				xtype: 'fieldset',
                title: LABEL['yourIdea'],
                instructions: LABEL['insertNewMessage'],
				style: 'margin-top: -30px; ',
                defaults: {
                    required: true,
                    labelWidth: '0%'
                },
                items: [{
					xtype: 'textareafield',
					name: 'frase',
					maxRows: 4
				}, {
					xtype: 'textfield',
					name: 'lingua',
					hidden: true,
					value: Parametri['Lingua']
				}]
			}, {
				xtype: 'button',
				text: LABEL['submit'],
				ui: 'confirm',
				scope: this,
				style: 'margin-top: -20px; ',
				handler: Submit
			}];
		} else {
			var items = [{
				xtype: 'toolbar',
				docked: 'top',
				title: LABEL['page4'],
				ui: Parametri['ui']
			}, {
				xtype: 'fieldset',
				instructions: LABEL['insertNewMessage'],
                title: LABEL['insertPhrase'],
                defaults: {
                    required: true,
                    labelWidth: '35%'
                },
                items: [{
					xtype: 'textfield',
					name: 'nick',
					label: LABEL['yourNickname'],
				}, {
					xtype: 'textareafield',
					name: 'frase',
					label: LABEL['yourIdea'],
					maxRows: 5
				}, {
					xtype: 'textfield',
					name: 'lingua',
					hidden: true,
					value: Parametri['Lingua']
				}]
			}, {
				xtype: 'button',
				text: LABEL['submit'],
				ui: 'confirm',
				scope: this,
				width: '40%',
				style: 'margin-left: 30%',
				handler: Submit
			}];
		}
		var Inserisci = Ext.create('Ext.form.Panel', {
			title: LABEL['page4'],
			iconCls: 'compose',
			cls: 'card4 card',
			badgeText: '',
			listeners: {
				painted: function() {
					var nick = Inserisci.getValues(true).nick;
					if ((nick == null || nick == "") && User != null && User != "") 
						Inserisci.setValues({ nick: User });
				}
			},
			items: items
		});
		
		var Toggle = Ext.create('Ext.field.Toggle', {
			xtype: 'togglefield',
			name: 'inglese',
			label: LABEL['inglese'],
			listeners: {
				change: function(slider, thumb, newValue, oldValue) {
					VisInglese = (newValue == 1 ? true : false);
					ChuckList.setScrollToTopOnRefresh(true);
					FrasiStore.getProxy().setExtraParam("len2", (VisInglese ? "en" : ''));
					SearchStore.getProxy().setExtraParam("len2", (VisInglese ? "en" : ''));
					Migliori.setScrollToTopOnRefresh(true);
					ClassStore.getProxy().setExtraParam("len2", (VisInglese ? "en" : ''));
					if (navigator.onLine) {
						FrasiStore.loadPage(1, {});
						SearchStore.loadPage(1, {});
						ClassStore.loadPage(1, {});
					}
					db.transaction(function (tx) {
						tx.executeSql('UPDATE inglese SET visualizza = ' + (VisInglese ? 1 : 0) ,[], function(tx, result){} ,function(tx,result){});
					});
				}
			}
		});
		var Info = Ext.create('Ext.form.Panel',  {
			title: LABEL['page5'],
			iconCls: 'info',
			cls: 'infoPage',
			badgeText: '',
			listeners: {
				painted: function() {
					Toggle.setValue(VisInglese ? 1 : 0);
				}
			},
			items: [{
				xtype: 'toolbar',
				docked: 'top',
				title: LABEL['page5'],
				ui: Parametri['ui']
			}, {
				html: LABEL['infoPage'],
				cls: 'info',
				style: 'margin: 10px 0 20px 0',
			}, {
				xtype: "button",
				text: LABEL['appStore'],
				ui: 'confirm',
				width: (isPhone ? '100%' : '40%'),
				style: (isPhone ? 'margin: 0px 0 20px 0' : 'margin: 0px 0 40px 30%'),
				handler: function(el, e, opt) {
					if (navigator.onLine && UrlAppStore != "")
						window.open(UrlAppStore);
					else
						Ext.Msg.alert(LABEL['error'], LABEL['connectionError']);
				}
			}, (Parametri['Lingua'] != "en" ? {
                xtype: 'fieldset',
				instructions: LABEL['istruzioniInglese'],
                title: LABEL['impostazioni'],
				style: (isPhone ? '' : 'margin: 0px 0 50px 0'),
				defaults: {
                    labelWidth: '65%'
                },
                items: [Toggle]
            } : {}), {
				html: LABEL['ringraziamenti'] + "<br><br> www.chucknorris.com.br <br> www.chucknorrisfacts.fr <br> www.taringa.net <br> www.welovechucknorris.it <br> www.4c.cc <br> blog.kaputtendorf.de <br> absurdopedia.wikia.com <br><br>",
				cls: 'ringraziamenti'
			}]
		});
		
		var TabPanel = Ext.create('Ext.tab.Panel', {
            xtype: 'tabpanel',
            tabBar: {
                docked: 'bottom'
            },
			layout: {
				type: 'card',
				animation: 'slide'
			},
			fullscreen: true,
            defaults: {
                scrollable: true
            },
			ui: Parametri['ui'],
            items: [
				ChuckList, 
				Migliori,
				Preferite,
				Inserisci,
				Info
            ]
        });
        Ext.Viewport.add(TabPanel);
    }
});
}