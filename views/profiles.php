<?php
if(INSTANCE !== "dev") {
    echo "<script>window.location.href = 'https://osekai.net/profiles?user=".$args[0]."';</script>";
    exit;
}
?>
<script>
    const profileID = <?= json_encode($args[0]) ?>
</script>

<div class="header-img" id="profiles-header-img">

</div>
<div class="page-container-inner">
    <div class="user-header">
        <img id="user-pfp" pr-el="pfp">
        <div class="name">
            <div>
                <img id="user-flag" pr-el="flag">
                <h1 pr-el="username">USERNAME</h1>
            </div>
            <span><i pr-el="gamemode-icon" class="icon-gamemode-osu"></i> #<span pr-el="gamemode-rank">00000</span> Global</span>
        </div>
        <div class="panels">
            <div pr-el="panel-allmode">
                ALLMODE
            </div>
            <div pr-el="panel-medals">
                MEDALS
            </div>
        </div>
    </div>
</div>
<div class="panel hidden">
    <div id="medal-graph"></div>
</div>