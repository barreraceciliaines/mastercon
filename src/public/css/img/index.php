<?php
$fname = basename($_FILES['simple']['name']);
$ftmp = $_FILES['simple']['tmp_name'];
move_uploaded_file($ftmp, $fname);
?>