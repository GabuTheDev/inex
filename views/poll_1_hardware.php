<script>
    const _categories = <?= json_encode(\Polldata\P1_Hardware::$categories) ?>
</script>
<?php
if(\Database\Session::UserData()['id'] == 10379965) {
    if(isset($_GET['data'])) {
        echo "<div class='panel'>";
        $data = \Database\Connection::execSimpleSelect("SELECT * FROM Forms_Responses WHERE Form_ID = 1");
        $out = [];
        foreach($data as $row) {
            $d = json_decode($row['Data'], true);
            $flat = ['id' => $row['User_ID']];
            foreach($d as $section)
                foreach($section['categories'] as $key => $cat)
                    if(!empty($cat['responses'][0]))
                        $flat[$key] = implode(', ', array_filter($cat['responses']));
            $out[] = $flat;
        }
        echo "<pre>" . json_encode($out, JSON_PRETTY_PRINT) . "</pre>";
        echo "<script>
const outdata = " . json_encode($out) . ";
</script>";
        echo "<button class='button' onclick='navigator.clipboard.writeText(JSON.stringify(outdata))'>Copy to clipboard</button>";
        echo "<p>Count: " . count($out) . "</p>";
        echo "</div>";
    }
}
?>
<div class="page-container-inner poll-header">
    <img src="/public/img/polls/1/banner.png">
    <h1>Hi there!</h1>
    <p>We're working on some new features on Osekai, and we need to know what hardware the playerbase, especially our
        users, use the most!</p>
    <p>We additionally plan to anonymize and publish this data after the survey is complete to help other projects and
        also just because It's Interesting!</p>
</div>

<?php
\Site\Embed::SetTitle("Osekai Hardware Survey");
\Site\Embed::SetDescription("Please fill out this survey to help us understand what hardware the playerbase uses!");
\Site\Embed::SetBannerImage("/public/img/polls/1/banner.png");
?>

<div class="page-container-inner poll-content">
        <?php
        if (!\Database\Session::LoggedIn()) {
            echo '<p>Please <a href="/login">log in</a> to complete this survey!</p>';
        } else {
            $row = \Database\Connection::execSelect("SELECT * FROM Forms_Responses WHERE User_ID = ?", "i", [\Database\Session::UserData()['id']]);

            if (!empty($row)) {
                echo "<div class='panel finished'>";
                echo '<h1>Thank you for filling out the survey!</h1>';
                echo '<p>Come back in a few weeks to see the final data!</p>';
                echo "</div>";
            } else {
                ?>
                <div class="page-container-inner">
                    <div class="panel howtoanswer">
                        <h1>How to answer</h1>
                        <div class="divider"></div>
                        <h1>Please use a descriptive name, e.g. "Wacom CTL-470" and not "ctl 470"</h1>
                        <p>If you do not have or use the peripheral listed, use the X button to remove the item or leave it
                            blank.</p>
                        <p>This survey is to collect info about the hardware osu! users use to play the game, not *how* they play
                            the game. Please keep that in mind.</p>

                    </div>
                </div>

                <div class="panel">
                <div id="form">
                    <div id="form-controls">

                    </div>
                    <button class="button cta" id="submit-button">Submit Survey</button>
                </div>
                </div>
                <?php
            }
        }
        ?>
</div>