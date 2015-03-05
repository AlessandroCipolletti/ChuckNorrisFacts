<?php
	include("connectChuckNorris.php");
	
	function OK ($str) {
		if (!is_numeric($str)) {
			$str = str_replace('"', "", $str);
			$str = str_replace("'", "", $str);
			$str = str_replace(";", "", $str);
			$str = str_replace("delete from", "", $str);
			$str = str_replace("delete * from", "", $str);
		}
		return $str;
	}
	function OKQ ($str) {
		$str = str_replace('&', "", $str);
		$str = str_replace(';', "", $str);
		$str = str_replace('"', '\"', $str);
		$str = str_replace("'", "\'", $str);
		$str = str_replace('%', "", $str);
		$str = str_replace(";", "", $str);
		$str = str_replace("delete from", "", $str);
		$str = str_replace("delete * from", "", $str);
		return $str;
	}
	
	$limit = (isset($_GET['l']) ? OK($_GET['l']) : 50);
	$start = (isset($_GET['s']) ? OK($_GET['s']) : 0);
	$page = (isset($_GET['page']) ? OK($_GET['page']) : 1);
	$len = (isset($_GET['len']) ? OK($_GET['len']) : "en");
	$len2 = (isset($_GET['len2']) && $_GET['len2'] != null && $_GET['len2'] != "" ? OK($_GET['len2']) : "");
	if ($len != "en" && mysql_num_rows(mysql_query("SELECT ID FROM $tabella WHERE lingua = '$len'")) == 0)
		$len = "en";
	//$data = (isset($_GET['date']) ? OK($_GET['date']) : date("Y-m-d H:i:s"));
	
	if ($len2 != "")
		$whereLingua = " (lingua = '$len' OR lingua = '$len2') ";
	else
		$whereLingua = " lingua = '$len' ";
	
	if (isset($_GET['q']) && OK($_GET['q']) <> "") {
		$str = OKQ($_GET['q']);
		if (strlen($str) > 1)
			$where = "AND (frase LIKE '%$str%' OR autore LIKE '%$str%')";
		else
			$where = "AND false";
	}
	
	$ris = array();
	
	if (!isset($_GET['q'])) 
		$SQL = "SELECT * FROM $tabella WHERE $whereLingua ORDER BY data DESC LIMIT $start, $limit";
	elseif ($_GET['q'] <> "" && strlen($_GET['q']) > 1)
		$SQL = "SELECT * FROM $tabella WHERE $whereLingua $where ORDER BY voti DESC LIMIT $start, $limit";
	else
		$SQL = "SELECT * FROM $tabella WHERE 1 = 0";
	//mail("bella_cippo@hotmail.it","ciao",$SQL);
	
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