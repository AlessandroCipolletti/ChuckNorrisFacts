<?php
	include("connectChuckNorris.php");
	
	$len = (isset($_GET['len']) ? $_GET['len'] : "en");
	$len2 = (isset($_GET['len2']) ? $_GET['len2'] : "");
	if ($len != "en" && mysql_num_rows(mysql_query("SELECT ID FROM $tabella WHERE lingua = '$len'")) == 0)
		$len = "en";
	$ris = array();
	
	$SQL = "SELECT * FROM $tabella WHERE (lingua = '$len' OR lingua = '$len2') ORDER BY RAND() LIMIT 0, 5";
	$q = mysql_query($SQL);
	$s = mysql_fetch_array($q);
	while ($s) {
		$ris[] = array(
			"ID" 		=> $s['ID'],
			"frase"		=> $s['frase'],
			"autore"	=> $s['autore'],
			"voti"		=> $s['voti'],
			"data"		=> $s['data'],
			"lingua"	=> $s['lingua']
		);
		$s = mysql_fetch_array($q);
	}
	$RIS = array(
		'q'			=> $_SERVER['QUERY_STRING'],
		'sql'		=> $SQL,
		'num'		=> count($ris),
		'results'	=> $ris
	);
	$f = $_GET['fun']."(";
	$f .= json_encode($ris);
	$f .= ")";
	echo $f;
?>