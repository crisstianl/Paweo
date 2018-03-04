<?php

if(isset($_POST['filename'])){
	$file = $_POST['filename'];	
	$content = $_POST['content'];

	echo $content;

	header('Content-type: application/json');
    header('Content-Disposition: attachment; filename="'.$file.'"');    	

	exit();
}

?>