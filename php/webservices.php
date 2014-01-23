<?php

	header("Content-type: application/json");
	if(!empty($_POST['filename']) && !empty($_POST['content'])){
		$saved = saveFile($_POST['filename'], $_POST['content']);
		if($saved){
			buildResponse(200, "File saved succesfully");	
		}else{
			buildResponse(200, "File saved with errors");	
		}
	}else{
		buildResponse(400, "Invalid request with null parameters");
	}
	
	function buildResponse($status, $message){
		header("HTTP/1.1 $status $message");	
		$response['status'] = $status;
		$response['mesage'] = $message;
		
		$json_response = $json_encode($response);
		echo $json_response;
	}
	
	function saveFile($filename, $content){
		header('Content-type: application/json');
		header('Content-disposition: attachment;filename=abbb.json');
		echo $content;
		return true;
	} 	
?>