<?php
	include("connectChuckNorris.php");
	
	function OK ($str) {
		$str = str_replace('<br />', " ", $str);
		$str = str_replace('<br/>', " ", $str);
		$str = str_replace('<br>', " ", $str);
		$str = str_replace('"', "''", $str);
		$str = str_replace('&quot;', "''", $str);
		$str = str_replace('&#039;', "'", $str);
		$str = html_entity_decode($str);
		$str = str_replace('&eacute;', "é", $str);
		$str = str_replace('&ecirc;', "ê", $str);
		$str = str_replace('&egrave;', "è", $str);
		$str = str_replace('&agrave;', "à", $str);
		$str = str_replace('&ugrave;', "ù", $str);
		$str = str_replace('&igrave;', "ì", $str);
		$str = str_replace('&ograve;', "ò", $str);
		$str = addslashes(htmlentities($str, ENT_QUOTES, "UTF-8"));
		$str = str_replace(array("\n", "\r"), " ", $str);
		$str = str_replace(array("<b>", "</b>", "<i>", "</i>", "&lt;b&gt;", "&lt;/b&gt;", "&lt;i&gt;", "&lt;/i&gt;"), "", $str);
		$str = str_replace("		", " ", $str);
		/*
		while (strpos($str, "<") != false) {
			$str = substr($str, 0, strpos($str, '<')) + substr($str, strpos($str, '>') + 1, strlen($str));;
		}
		*/
		//$str = htmlspecialchars($str);
		return $str;
	}
	
	$lingua = OK($_POST['lingua']);
	$nick = OK($_POST['nick']);
	$frase = OK($_POST['frase']);
	
	
	
	/*
	//PARTE PER PRENDERE AUTOMATICAMENTE NUOVE FRASI IN EN-US
	for ($i = 0; $i < 100; $i++) {
		$page = file_get_contents("http://4q.cc/index.php?pid=fact&person=chuck");
		$page = substr($page, strpos($page, '<div id="factbox">') + 20);
		$page = substr($page, 0, strpos($page, '</div>'));
		$page = OK($page);
		if (mysql_num_rows(mysql_query("SELECT * FROM $tabella WHERE frase = '$page'")) == 0)
			mysql_query("INSERT INTO $tabella (frase, autore, lingua) VALUES ('$page', 'www.4c.cc', 'en-us')");
	}
	*/
	/*
	// FR-FR
	for ($i = 0; $i < 100; $i++) {
		$page = file_get_contents("http://www.chucknorrisfacts.fr/index.php?p=parcourir&tri=aleatoire");
		while(strpos($page, '<div class="fact"') != false) {
			$page = substr($page, strpos($page, '<div class="fact"'));
			$page = substr($page, strpos($page, '>') + 1);
			$fra = OK(substr($page, 0, strpos($page, '</div>')));
			if (mysql_num_rows(mysql_query("SELECT * FROM $tabella WHERE frase = '$fra'")) == 0 && $fra != "")
				mysql_query("INSERT INTO $tabella (frase, autore, lingua) VALUES ('$fra', 'http://www.chucknorrisfacts.fr', 'fr-fr')");
		}
	}
	*/
	/*
	//PT-PT
	for ($i = 0; $i < 100; $i++) {
		$page = file_get_contents("http://www.chucknorris.com.br/");
		$page = substr($page, strpos($page, '<tr><td>') + 8);
		$page = substr($page, strpos($page, '-') + 2);
		$page = substr($page, 0, strpos($page, '&nbsp;&nbsp;'));
		$page = OK($page);
		
		if (mysql_num_rows(mysql_query("SELECT * FROM $tabella WHERE frase = '$page'")) == 0 && $page != "")
			mysql_query("INSERT INTO $tabella (frase, autore, lingua) VALUES ('$page', 'chucknorris.com.br', 'pt-pt')");
	}
	*/
	
	$frase = str_replace("chuck", "Chuck", $frase);
	$frase = str_replace("norris", "Norris", $frase);
	$frase = str_replace("CHUCK", "Chuck", $frase);
	$frase = str_replace("NORRIS", "Norris", $frase);
	$frase = str_replace("chucknorris", "Chuck Norris", $frase);
	$frase = str_replace("  ", " ", $frase);
	$frase = ucfirst($frase);
	
	$ris = array();
	$error = 0;
	
	if (strpos($frase, "Chuck") === false) {
		$error = 2;
	} else if (strpos(strtolower($frase), "delete from") != false || strpos(strtolower($frase), "delete * from") != false || strpos(strtolower($nick), "delete from") != false || strpos(strtolower($nick), "delete * from") != false) {
		$error = 3;
	} else if (mysql_num_rows(mysql_query("SELECT * FROM $tabella WHERE frase = '$frase'")) > 0) {
		$error = 4;
	} else if ($nick == "" || $nick == null || $frase == "" || $frase == null) {
		$error = 5;
	}
	
	if ($error == 0) {		
		$sql = "INSERT INTO $tabella (frase, autore, lingua) VALUES ('$frase', '$nick', '$lingua')";
		//$sql = $megaSQL;
		
		if (mysql_query($sql)) {
			$ris = array('success' => true, 'error' => "OK");
		} else {
			$error = 1;
			$ris = array('success' => false, 'error' => $error);
		}
	} else {
		$ris = array('success' => false, 'error' => $error);
	}
	
	$f = json_encode($ris);
	echo $f;
?>





