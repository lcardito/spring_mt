<?php
$spectrum_site = urldecode($_REQUEST["state"]);
header("Location: ".$spectrum_site."?".$_SERVER['QUERY_STRING']);
?>
