<?php
	include("connectChuckNorris.php");
	
	$action = (isset($_GET['action']) ? $_GET['action'] : "");
	$ID = (isset($_GET['id']) ? $_GET['id'] : 0);
	$ris = array();
	
	if ($ID <> 0 && $action <> "") {
		$r = mysql_fetch_array(mysql_query("SELECT voti FROM $tabella WHERE ID = $ID "));
		if ($r) {
			$voti = (int)$r['voti'];
			if ($action == "add")
				$voti = $voti + 1;
			else if ($action == "sub")
				$voti = $voti - 1;
			if ($voti < 0)
				$voti = 0;
			mysql_query("UPDATE $tabella SET voti = $voti WHERE ID = $ID");
			$ris = array($r['voti'], $voti, $ID, $action, $_SERVER['QUERY_STRING']);
		}
	}
	
	$f = $_GET['fun']."(";
	$f .= json_encode($RIS);
	$f .= "');";
	echo $f;
?>