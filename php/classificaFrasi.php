<?php
	include("connectChuckNorris.php");
	
	$limit = (isset($_GET['l']) ? $_GET['l'] : 50);
	$start = (isset($_GET['s']) ? $_GET['s'] : 0);
	$page = (isset($_GET['page']) ? $_GET['page'] : 1);
	$len = (isset($_GET['len']) ? $_GET['len'] : "en");
	$len2 = (isset($_GET['len2']) ? $_GET['len2'] : "");
	if ($len != "en" && mysql_num_rows(mysql_query("SELECT ID FROM $tabella WHERE lingua = '$len'")) == 0)
		$len = "en";
	$ris = array();
	
	
	$SQL = "SELECT * FROM $tabella WHERE (lingua = '$len' OR lingua = '$len2') ORDER BY voti DESC LIMIT $start, $limit";
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
		'results'	=> $ris
	);
	$f = $_GET['fun']."(";
	$f .= json_encode($RIS);
	$f .= ")";
	echo $f;
?>